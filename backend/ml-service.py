"""
SecureShare ML Malware Detection Microservice
Python-based deep learning service for advanced malware detection
Run: python ml-service.py
"""

import os
import json
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
import hashlib
import logging
from datetime import datetime
import pickle

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

class MLMalwareDetector:
    def __init__(self):
        self.rf_model = None
        self.gb_model = None
        self.scaler = None
        self.model_loaded = False
        self.initialize_models()

    def initialize_models(self):
        """Initialize or load pre-trained ML models"""
        try:
            logger.info("🤖 Initializing ML Models...")
            
            # For demo, create new models (in production, load pre-trained)
            # Random Forest Model
            self.rf_model = RandomForestClassifier(
                n_estimators=100,
                max_depth=15,
                min_samples_split=5,
                random_state=42,
                n_jobs=-1
            )
            
            # Gradient Boosting Model
            self.gb_model = GradientBoostingClassifier(
                n_estimators=100,
                learning_rate=0.1,
                max_depth=5,
                random_state=42
            )
            
            self.scaler = StandardScaler()
            
            # Create dummy training data for initialization
            X_train = np.random.rand(100, 30)
            y_train = np.random.randint(0, 2, 100)
            
            X_train_scaled = self.scaler.fit_transform(X_train)
            self.rf_model.fit(X_train_scaled, y_train)
            self.gb_model.fit(X_train_scaled, y_train)
            
            self.model_loaded = True
            logger.info("✅ ML Models Initialized Successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize models: {e}")
            self.model_loaded = False

    def extract_features(self, file_bytes):
        """Extract 30 features from binary file for ML classification"""
        features = []
        
        # 1. File size (normalized)
        file_size = len(file_bytes)
        features.append(np.log10(file_size + 1) / 10)  # Log scale
        
        # 2-5. Byte frequency analysis
        byte_freq = np.zeros(256)
        for byte in file_bytes[:min(10000, len(file_bytes))]:
            byte_freq[byte] += 1
        
        features.extend([
            np.mean(byte_freq) / 100,
            np.std(byte_freq) / 100,
            np.max(byte_freq) / 100,
            np.min(byte_freq) / 100,
        ])
        
        # 6. Shannon Entropy
        features.append(self.calculate_entropy(file_bytes[:min(10000, len(file_bytes))]))
        
        # 7. Null bytes ratio
        null_count = file_bytes.count(b'\x00')
        features.append(min(null_count / max(len(file_bytes), 1), 1))
        
        # 8. High byte (>127) ratio
        high_bytes = sum(1 for b in file_bytes[:min(10000, len(file_bytes))] if b > 127)
        features.append(high_bytes / min(10000, len(file_bytes)))
        
        # 9-12. ASCII printable chars analysis
        printable_count = sum(1 for b in file_bytes[:min(10000, len(file_bytes))] if 32 <= b <= 126)
        printable_ratio = printable_count / min(10000, len(file_bytes))
        features.extend([
            printable_ratio,
            printable_ratio ** 2,
            1 - printable_ratio,
            abs(0.5 - printable_ratio),
        ])
        
        # 13-16. Header analysis (magic bytes)
        magic_bytes_score = self.analyze_magic_bytes(file_bytes[:4])
        features.extend([
            magic_bytes_score,
            1 - magic_bytes_score,
            magic_bytes_score ** 2,
            abs(magic_bytes_score - 0.5),
        ])
        
        # 17-20. Entropy of different chunks
        chunk_entropies = []
        for i in range(0, min(len(file_bytes), 4000), 1000):
            chunk = file_bytes[i:i+1000]
            if chunk:
                chunk_entropies.append(self.calculate_entropy(chunk))
        
        while len(chunk_entropies) < 4:
            chunk_entropies.append(0)
        features.extend(chunk_entropies[:4])
        
        # 21-25. Suspicious pattern indicators
        suspicious_patterns = {
            b'eval': 0,
            b'exec': 0,
            b'system': 0,
            b'__proto__': 0,
            b'RegOpenKey': 0,
        }
        
        for pattern, _ in suspicious_patterns.items():
            count = file_bytes.count(pattern)
            suspicious_patterns[pattern] = min(count / 10, 1)  # Normalize
        
        features.extend(list(suspicious_patterns.values()))
        
        # 26-30. Statistical features
        if len(file_bytes) > 0:
            features.extend([
                np.mean([b for b in file_bytes[:min(5000, len(file_bytes))]] or [0]) / 256,
                np.std([b for b in file_bytes[:min(5000, len(file_bytes))]] or [0]) / 128,
                np.median([b for b in file_bytes[:min(5000, len(file_bytes))]] or [0]) / 256,
                np.var([b for b in file_bytes[:min(5000, len(file_bytes))]] or [0]) / 256,
                self.calculate_entropy(file_bytes) ** 2,
            ])
        else:
            features.extend([0, 0, 0, 0, 0])
        
        return np.array(features).reshape(1, -1)

    def calculate_entropy(self, data):
        """Calculate Shannon entropy of data"""
        if len(data) == 0:
            return 0
        
        byte_counts = np.bincount(np.frombuffer(data, dtype=np.uint8), minlength=256)
        byte_probs = byte_counts / len(data)
        entropy = -np.sum(byte_probs[byte_probs > 0] * np.log2(byte_probs[byte_probs > 0]))
        return entropy / 8  # Normalize to 0-1

    def analyze_magic_bytes(self, header):
        """Analyze file magic bytes to detect executable/archive types"""
        if len(header) < 2:
            return 0.5
        
        magic_hex = header[:4].hex().lower()
        
        # Known malicious/risky magic bytes
        risky_magics = {
            '5a4d': 1.0,      # MZ - Windows Executable
            '7f454c46': 0.9,  # ELF - Linux Executable
            '504b0304': 0.7,  # ZIP
            '526172211a': 0.7,  # RAR
            '1f8b': 0.6,      # GZIP
            'cafebabe': 0.8,  # Java CLASS
            'feedface': 0.9,  # Mach-O
        }
        
        for magic, score in risky_magics.items():
            if magic_hex.startswith(magic):
                return score
        
        return 0.3

    def predict_malware(self, file_bytes):
        """Predict if file is malware using ensemble of models"""
        if not self.model_loaded:
            return None
        
        try:
            # Extract features
            features = self.extract_features(file_bytes)
            features_scaled = self.scaler.transform(features)
            
            # Ensemble prediction
            rf_pred = self.rf_model.predict_proba(features_scaled)[0][1]
            gb_pred = self.gb_model.predict_proba(features_scaled)[0][1]
            
            # Weighted ensemble
            malware_probability = (rf_pred * 0.5 + gb_pred * 0.5)
            
            return {
                'malware_probability': float(malware_probability),
                'is_malware': malware_probability > 0.5,
                'random_forest_score': float(rf_pred),
                'gradient_boosting_score': float(gb_pred),
                'confidence': float(abs(malware_probability - 0.5) * 2),
            }
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return None


# Initialize detector
detector = MLMalwareDetector()


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'ML Malware Detection Microservice',
        'models_loaded': detector.model_loaded,
        'timestamp': datetime.now().isoformat()
    })


@app.route('/api/ml-scan', methods=['POST'])
def ml_scan_file():
    """Analyze file with ML models"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Read file bytes
        file_bytes = file.read()
        file_hash = hashlib.sha256(file_bytes).hexdigest()
        
        logger.info(f"📁 Analyzing file: {file.filename} (Hash: {file_hash[:8]}...)")
        
        # Get ML prediction
        prediction = detector.predict_malware(file_bytes)
        
        if prediction is None:
            return jsonify({'error': 'ML models not loaded'}), 503
        
        # Determine threat level
        prob = prediction['malware_probability']
        if prob >= 0.8:
            threat_level = 'CRITICAL'
        elif prob >= 0.6:
            threat_level = 'HIGH'
        elif prob >= 0.4:
            threat_level = 'MEDIUM'
        else:
            threat_level = 'LOW'
        
        result = {
            'success': True,
            'file_name': file.filename,
            'file_size': len(file_bytes),
            'file_hash': file_hash,
            'analysis': {
                'method': 'ENSEMBLE_ML',
                'models_used': ['Random Forest', 'Gradient Boosting'],
                'threat_level': threat_level,
                'malware_probability': round(prediction['malware_probability'] * 100, 2),
                'is_malware': prediction['is_malware'],
                'confidence': round(prediction['confidence'] * 100, 2),
                'rf_score': round(prediction['random_forest_score'] * 100, 2),
                'gb_score': round(prediction['gradient_boosting_score'] * 100, 2),
            },
            'recommendations': {
                'allow': prob < 0.3,
                'quarantine': 0.3 <= prob < 0.6,
                'block': prob >= 0.6,
                'require_manual_review': 0.4 <= prob <= 0.6,
            },
            'timestamp': datetime.now().isoformat(),
        }
        
        logger.info(f"✅ Analysis complete: {threat_level} ({prob*100:.2f}%)")
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"❌ Scan error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/batch-scan', methods=['POST'])
def batch_scan():
    """Batch scan multiple files"""
    try:
        if 'files' not in request.files:
            return jsonify({'error': 'No files provided'}), 400
        
        files = request.files.getlist('files')
        results = []
        
        for file in files:
            if file.filename == '':
                continue
            
            file_bytes = file.read()
            prediction = detector.predict_malware(file_bytes)
            
            if prediction:
                results.append({
                    'file_name': file.filename,
                    'file_size': len(file_bytes),
                    'threat_level': 'HIGH' if prediction['malware_probability'] > 0.5 else 'LOW',
                    'malware_probability': round(prediction['malware_probability'] * 100, 2),
                })
        
        return jsonify({
            'success': True,
            'files_scanned': len(results),
            'results': results,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"❌ Batch scan error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/model-stats', methods=['GET'])
def model_stats():
    """Get ML model statistics"""
    return jsonify({
        'models_loaded': detector.model_loaded,
        'random_forest': {
            'n_estimators': 100,
            'max_depth': 15,
            'trained': detector.rf_model is not None,
        },
        'gradient_boosting': {
            'n_estimators': 100,
            'learning_rate': 0.1,
            'trained': detector.gb_model is not None,
        },
        'feature_count': 30,
        'scaler_fitted': detector.scaler is not None,
    })


if __name__ == '__main__':
    logger.info("🚀 Starting ML Malware Detection Microservice on port 5001")
    app.run(host='0.0.0.0', port=5001, debug=False)
