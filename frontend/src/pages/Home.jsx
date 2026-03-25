import React, { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ====== ADVANCED 3D BACKGROUND COMPONENT ======
function ThreeBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!window.THREE) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
      script.onload = () => initThreeScene();
      document.head.appendChild(script);
    } else {
      initThreeScene();
    }

    function initThreeScene() {
      const THREE = window.THREE;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      mountRef.current?.appendChild(renderer.domElement);

      // Create geometric "Data Cloud"
      const geometry = new THREE.IcosahedronGeometry(2, 1);
      const wireframe = new THREE.WireframeGeometry(geometry);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xff3b3b,
        transparent: true,
        opacity: 0.15
      });
      const line = new THREE.LineSegments(wireframe, lineMaterial);
      scene.add(line);

      // Particles
      const particlesGeometry = new THREE.BufferGeometry();
      const posArray = new Float32Array(5000 * 3);
      for (let i = 0; i < 5000 * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 10;
      }
      particlesGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(posArray, 3)
      );
      const particlesMaterial = new THREE.PointsMaterial({
        size: 0.005,
        color: 0xffffff,
        transparent: true,
        opacity: 0.5
      });
      const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
      scene.add(particlesMesh);

      camera.position.z = 5;

      let mouseX = 0;
      let mouseY = 0;

      const handleMouseMove = (event) => {
        mouseX = event.clientX / window.innerWidth - 0.5;
        mouseY = event.clientY / window.innerHeight - 0.5;
      };

      window.addEventListener("mousemove", handleMouseMove);

      const animate = () => {
        requestAnimationFrame(animate);
        line.rotation.y += 0.002;
        line.rotation.x += 0.001;

        particlesMesh.rotation.y += 0.001;

        // Reactive movement
        camera.position.x += (mouseX * 2 - camera.position.x) * 0.05;
        camera.position.y += (-mouseY * 2 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
      };

      animate();

      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("resize", handleResize);
        mountRef.current?.removeChild(renderer.domElement);
      };
    }
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
        opacity: 0.4
      }}
    />
  );
}

// ====== SIDE MENU NAVIGATION COMPONENT ======
function SideMenuNavigation() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const contentRef = useRef(null);
  const textRef = useRef(null);
  const canvasRef = useRef(null);

  const menuItems = [
    {
      title: "BLOCKCHAIN",
      subtitle: "Smart Contract Verification",
      color: "#FF3B30",
      description: "Ethereum-powered access control",
      bgImage: "https://images.pexels.com/photos/8386159/pexels-photo-8386159.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop"
    },
    {
      title: "ENCRYPTION",
      subtitle: "Military-Grade Security",
      color: "#FF3B30",
      description: "AES-256 client-side protection",
      bgImage: "https://images.pexels.com/photos/8386422/pexels-photo-8386422.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop"
    },
    {
      title: "AUTHENTICATION",
      subtitle: "Identity Management",
      color: "#FF3B30",
      description: "Multi-factor secure authentication",
      bgImage: "https://images.pexels.com/photos/8386265/pexels-photo-8386265.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop"
    },
    {
      title: "AI & INTELLIGENCE",
      subtitle: "Threat Detection",
      color: "#FF3B30",
      description: "Real-time malware analysis",
      bgImage: "https://images.pexels.com/photos/17485661/pexels-photo-17485661.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop"
    },
    {
      title: "DASHBOARD",
      subtitle: "Real-Time Monitoring",
      color: "#FF3B30",
      description: "Tactical command center",
      bgImage: "https://images.pexels.com/photos/16407947/pexels-photo-16407947.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop"
    }
  ];

  // Advanced 3D Canvas Background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 500,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        vz: Math.random() * 2,
        size: Math.random() * 4 + 1,
        opacity: Math.random() * 0.6 + 0.2
      });
    }

    let time = 0;
    const animate = () => {
      ctx.fillStyle = "rgba(13, 13, 13, 0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      time += 0.01;

      // Draw grid
      ctx.strokeStyle = "rgba(255, 59, 48, 0.08)";
      ctx.lineWidth = 1;
      const gridSize = 120;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.z -= p.vz;

        if (p.z <= 0) {
          p.z = 500;
          p.x = Math.random() * canvas.width;
          p.y = Math.random() * canvas.height;
        }
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        const scale = 500 / (500 + p.z);
        const x = canvas.width / 2 + (p.x - canvas.width / 2) * scale;
        const y = canvas.height / 2 + (p.y - canvas.height / 2) * scale;

        ctx.fillStyle = `rgba(255, 59, 48, ${p.opacity * scale * 0.8})`;
        ctx.beginPath();
        ctx.arc(x, y, p.size * scale, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Smooth image transition
    const section = contentRef.current?.parentElement;
    if (section) {
      gsap.to(section, {
        backgroundImage: `linear-gradient(135deg, rgba(13,13,13,0.7) 0%, rgba(13,13,13,0.8) 100%), url('${menuItems[currentIndex].bgImage}')`,
        duration: 1.2,
        ease: "power2.inOut"
      });
    }

    // Animate text with scale
    gsap.timeline()
      .to(textRef.current, {
        opacity: 0,
        y: -30,
        scale: 0.9,
        duration: 0.4,
        ease: "power2.in"
      }, 0)
      .to(textRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        ease: "elastic.out(1.2, 0.8)"
      }, 0.2);
  }, [currentIndex, menuItems]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % menuItems.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + menuItems.length) % menuItems.length);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowRight") handleNext();
    if (e.key === "ArrowLeft") handlePrev();
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <section
      ref={contentRef}
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 4rem",
        background: `linear-gradient(135deg, rgba(13,13,13,0.75) 0%, rgba(13,13,13,0.85) 100%), url('${menuItems[currentIndex].bgImage}') center/cover no-repeat`,
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundColor: "#0D0D0D",
        position: "relative",
        overflow: "hidden",
        zIndex: 2
      }}
    >
      {/* Background Image Preload & Fallback */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)`,
          zIndex: 0,
          opacity: 0.3
        }}
      />

      {/* Advanced 3D Canvas Background */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: 0.6,
          zIndex: 1,
          pointerEvents: "none"
        }}
      />

      {/* Left Arrow Navigation */}
      <button
        onClick={handlePrev}
        style={{
          position: "absolute",
          left: "2.5rem",
          top: "50%",
          transform: "translateY(-50%)",
          width: "52px",
          height: "52px",
          borderRadius: "4px",
          background: "rgba(255, 59, 48, 0.1)",
          border: "1.5px solid #FF3B30",
          color: "#FF3B30",
          fontSize: "24px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 5,
          transition: "all 0.3s ease",
          backdropFilter: "blur(10px)",
          fontWeight: "bold",
          fontFamily: "'JetBrains Mono', monospace"
        }}
        onMouseEnter={(e) => {
          gsap.to(e.target, {
            background: "rgba(255, 59, 48, 0.25)",
            scale: 1.1,
            boxShadow: "inset 0 0 20px rgba(255, 59, 48, 0.4), 0 0 30px rgba(255, 59, 48, 0.6)",
            duration: 0.3
          });
        }}
        onMouseLeave={(e) => {
          gsap.to(e.target, {
            background: "rgba(255, 59, 48, 0.1)",
            scale: 1,
            boxShadow: "inset 0 0 0 rgba(255, 59, 48, 0), 0 0 0 rgba(255, 59, 48, 0)",
            duration: 0.3
          });
        }}
      >
        ←
      </button>

      {/* Center Content */}
      <div
        style={{
          textAlign: "center",
          zIndex: 3,
          maxWidth: "900px"
        }}
      >
        <div ref={textRef}>
          <h1
            style={{
              fontSize: "clamp(4rem, 10vw, 6.5rem)",
              fontWeight: 900,
              color: "#FF3B30",
              fontFamily: "'Helvetica Neue', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif",
              textTransform: "uppercase",
              letterSpacing: "-1px",
              marginBottom: "1.5rem",
              textShadow: "0 0 30px rgba(255, 59, 48, 0.5), 0 0 60px rgba(255, 59, 48, 0.2)",
              fontStyle: "normal",
              lineHeight: 1.05,
              fontVariationSettings: "'wdth' 100"
            }}
          >
            {menuItems[currentIndex].title}
          </h1>

          <div
            style={{
              width: "80px",
              height: "3px",
              background: "linear-gradient(to right, transparent, #FF3B30, transparent)",
              margin: "1.5rem auto 2rem",
              boxShadow: "0 0 20px rgba(255, 59, 48, 0.6)"
            }}
          />

          <p
            style={{
              fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
              color: "rgba(255, 255, 255, 0.85)",
              fontFamily: "'Helvetica Neue', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif",
              letterSpacing: "0.5px",
              marginBottom: "1.5rem",
              fontWeight: 700,
              textTransform: "uppercase"
            }}
          >
            {menuItems[currentIndex].subtitle}
          </p>

          <p
            style={{
              fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
              color: "rgba(255, 255, 255, 0.65)",
              fontFamily: "'Inter', sans-serif",
              letterSpacing: "0.8px",
              maxWidth: "700px",
              margin: "0 auto 2.5rem",
              lineHeight: 1.8,
              fontWeight: 300
            }}
          >
            {menuItems[currentIndex].description}
          </p>
        </div>

        {/* Progress Indicator */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
            marginTop: "3rem"
          }}
        >
          {menuItems.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === currentIndex ? "40px" : "12px",
                height: "12px",
                borderRadius: "6px",
                background: i === currentIndex ? "#FF3B30" : "rgba(255, 59, 48, 0.3)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: i === currentIndex ? "0 0 15px #FF3B30" : "none"
              }}
              onClick={() => setCurrentIndex(i)}
              onMouseEnter={(e) => {
                if (i !== currentIndex) {
                  gsap.to(e.target, { scale: 1.3, duration: 0.2 });
                }
              }}
              onMouseLeave={(e) => {
                if (i !== currentIndex) {
                  gsap.to(e.target, { scale: 1, duration: 0.2 });
                }
              }}
            />
          ))}
        </div>

      {/* Keyboard Hint */}
      <p
        style={{
          position: "absolute",
          bottom: "2.5rem",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "0.75rem",
          color: "rgba(255, 59, 48, 0.5)",
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "1px",
          zIndex: 3,
          textTransform: "uppercase"
        }}
      >
        use arrow keys to navigate
      </p>

      {/* Right Arrow Navigation */}
      <button
        onClick={handleNext}
        style={{
          position: "absolute",
          right: "2.5rem",
          top: "50%",
          transform: "translateY(-50%)",
          width: "52px",
          height: "52px",
          borderRadius: "4px",
          background: "rgba(255, 59, 48, 0.1)",
          border: "1.5px solid #FF3B30",
          color: "#FF3B30",
          fontSize: "24px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 5,
          transition: "all 0.3s ease",
          backdropFilter: "blur(10px)",
          fontWeight: "bold",
          fontFamily: "'JetBrains Mono', monospace"
        }}
        onMouseEnter={(e) => {
          gsap.to(e.target, {
            background: "rgba(255, 59, 48, 0.25)",
            scale: 1.1,
            boxShadow: "inset 0 0 20px rgba(255, 59, 48, 0.4), 0 0 30px rgba(255, 59, 48, 0.6)",
            duration: 0.3
          });
        }}
        onMouseLeave={(e) => {
          gsap.to(e.target, {
            background: "rgba(255, 59, 48, 0.1)",
            scale: 1,
            boxShadow: "inset 0 0 0 rgba(255, 59, 48, 0), 0 0 0 rgba(255, 59, 48, 0)",
            duration: 0.3
          });
        }}
      >
        →
      </button>
      </div>

    </section>
  );
}

// ====== ULTRA-KINETIC CORE COMPONENTS GRID ======
function CoreComponentsGrid() {
  const [activeCard, setActiveCard] = useState(0);
  const navigate = useNavigate();

  const coreComponents = [
    {
      id: "S-01",
      title: "AES-QUANTUM",
      icon: "🔐",
      description: "Military-grade quantum-resistant encryption with zero-knowledge proof verification and enterprise-scale key distribution infrastructure",
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80"
    },
    {
      id: "S-02",
      title: "IPFS-SWARM",
      icon: "🌐",
      description: "Decentralized mesh network with Byzantine-resistant consensus and autonomous self-healing replication across 10,000+ nodes",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"
    },
    {
      id: "S-03",
      title: "LEDGER-L2",
      icon: "⛓️",
      description: "Layer-2 blockchain architecture with sub-second finality and transparent smart contract audit trails for regulatory compliance",
      image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800&q=80"
    },
    {
      id: "S-04",
      title: "NEURAL-AI",
      icon: "🤖",
      description: "Deep-learning threat detection engine with real-time anomaly classification and predictive behavioral analysis at 99.7% accuracy",
      image: "https://images.unsplash.com/photo-1677442d019e157395c30f5951a89f869751a92dd1e94216c841ce4a4127cb33?w=800&q=80"
    }
  ];

  return (
    <section
      style={{
        background: "white",
        color: "black",
        padding: "6rem 3rem",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <div style={{ maxWidth: "1600px", margin: "0 auto", position: "relative", zIndex: 10 }}>
        {/* Section Header */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "4rem",
            borderBottom: "8px solid black",
            paddingBottom: "2rem"
          }}
        >
          <h2
            style={{
              fontSize: "clamp(3rem, 10vw, 5rem)",
              fontWeight: 900,
              fontStyle: "normal",
              textTransform: "uppercase",
              letterSpacing: "-0.5px",
              lineHeight: 0.9,
              margin: 0,
              fontFamily: "'Helvetica Neue', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            }}
          >
            Core_Set.
          </h2>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "10px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "4px",
              marginBottom: "1rem"
            }}
          >
            Sec_Verified_v2.0
          </div>
        </div>

        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "3rem",
            perspective: "2000px",
            maxWidth: "900px",
            margin: "0 auto"
          }}
        >
          {coreComponents.map((item, i) => (
            <ComponentCard
              key={i}
              item={item}
              index={i}
              isActive={activeCard === i}
              onHover={() => setActiveCard(i)}
              onClick={() => navigate("/login")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ====== ULTRA-KINETIC COMPONENT CARD ======
function ComponentCard({ item, index, isActive, onHover, onClick }) {
  const cardRef = useRef(null);
  const shadowRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      gsap.to(cardRef.current, {
        scale: 1.08,
        y: -15,
        boxShadow: "0 30px 60px rgba(0,0,0,0.4)",
        duration: 0.7,
        ease: "cubic-bezier(0.23, 1, 0.32, 1)"
      });
      gsap.to(shadowRef.current, {
        x: 8,
        y: 8,
        opacity: 1,
        duration: 0.7
      });
      // Shake animation
      gsap.to(cardRef.current, {
        keyframes: [
          { x: -2, duration: 0.05 },
          { x: 2, duration: 0.05 },
          { x: -2, duration: 0.05 },
          { x: 2, duration: 0.05 },
          { x: 0, duration: 0.05 }
        ],
        delay: 0.1
      });
    } else {
      gsap.to(cardRef.current, {
        scale: 0.92,
        opacity: 0.65,
        boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
        x: 0,
        duration: 0.7,
        ease: "cubic-bezier(0.23, 1, 0.32, 1)"
      });
      gsap.to(shadowRef.current, {
        x: 0,
        y: 0,
        opacity: 0,
        duration: 0.7
      });
    }
  }, [isActive]);

  const handleMouseEnter = () => {
    onHover();
    // Trigger random 45-degree diagonal shake movement
    gsap.to(cardRef.current, {
      keyframes: [
        { x: -5, y: -5, rotation: 3, duration: 0.06 },   // up-left 45°
        { x: 5, y: 5, rotation: -3, duration: 0.06 },    // down-right 45°
        { x: -5, y: 5, rotation: -3, duration: 0.06 },   // down-left 45°
        { x: 5, y: -5, rotation: 3, duration: 0.06 },    // up-right 45°
        { x: -3, y: -3, rotation: 2, duration: 0.05 },   // dampen up-left
        { x: 3, y: 3, rotation: -2, duration: 0.05 },    // dampen down-right
        { x: 0, y: 0, rotation: 0, duration: 0.05 }      // settle
      ],
      ease: "sine.inOut"
    });
  };

  const handleClick = () => {
    // 3D flip explosion animation
    gsap.timeline()
      .to(cardRef.current, {
        scale: 1.15,
        duration: 0.2
      })
      .to(cardRef.current, {
        rotateX: 90,
        rotateY: 180,
        opacity: 0,
        duration: 0.5,
        ease: "back.in"
      }, 0.2)
      .add(() => onClick(), 0.4);
  };

  return (
    <div
        ref={cardRef}
        onMouseEnter={handleMouseEnter}
        onClick={handleClick}
        style={{
          position: "relative",
          height: "600px",
          border: "4px solid black",
          background: isActive ? "black" : "transparent",
          cursor: "pointer",
          overflow: "hidden",
          opacity: isActive ? 1 : 0.65,
          transition: "opacity 0.3s ease",
          transformStyle: "preserve-3d"
        }}
      >
      {/* 3D Video Background */}
      {isActive && (
        <canvas
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.35,
            zIndex: 2
          }}
          key={"canvas-" + index}
          ref={(canvas) => {
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            const particles = [];
            for (let i = 0; i < 40; i++) {
              particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                z: Math.random() * 300,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                vz: Math.random(),
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5
              });
            }
            const animate = () => {
              ctx.fillStyle = "rgba(0,0,0,0.05)";
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.strokeStyle = "rgba(255, 59, 48, 0.1)";
              ctx.lineWidth = 0.5;
              for (let i = 0; i < 4; i++) {
                ctx.beginPath();
                ctx.moveTo(0, (canvas.height / 4) * i);
                ctx.lineTo(canvas.width, (canvas.height / 4) * i);
                ctx.stroke();
              }
              particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;
                p.z -= p.vz;
                if (p.z <= 0) p.z = 300;
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
                const scale = 300 / (300 + p.z);
                const x = canvas.width / 2 + (p.x - canvas.width / 2) * scale;
                const y = canvas.height / 2 + (p.y - canvas.height / 2) * scale;
                ctx.fillStyle = `rgba(255, 59, 48, ${p.opacity * scale})`;
                ctx.beginPath();
                ctx.arc(x, y, p.size * scale, 0, Math.PI * 2);
                ctx.fill();
              });
              requestAnimationFrame(animate);
            };
            animate();
          }}
        />
      )}

      {/* Dynamic Image Reveal */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: isActive ? 0.6 : 0.25,
          transform: isActive ? "scale(1.15) rotate(3deg)" : "scale(1) rotate(0deg)",
          transition: "all 1.2s cubic-bezier(0.23, 1, 0.32, 1)",
          filter: "grayscale(0.4) brightness(0.9)",
          zIndex: 1
        }}
      >
        <img
          src={item.image}
          alt={item.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover"
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.3) 30%, transparent 60%, rgba(0,0,0,0.5) 100%)"
          }}
        />
      </div>

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          height: "100%",
          padding: "2.5rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          color: isActive ? "white" : "black"
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "9px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "4px"
          }}
        >
          <span>{item.id}</span>
          <span style={{ opacity: isActive ? 1 : 0.2, color: isActive ? "#FF3B30" : "inherit" }}>
            Active_Scan
          </span>
        </div>

        {/* Center Content */}
        <div>
          <div
            style={{
            width: "16px",
            height: "3px",
            background: "#FF3B30",
            marginBottom: "1.5rem",
            transform: isActive ? "scaleX(1.6)" : "scaleX(1)",
            transition: "all 0.6s cubic-bezier(0.23, 1, 0.32, 1)",
            transformOrigin: "left",
            boxShadow: isActive ? "0 0 12px #FF3B30" : "none"
            }}
          />
          <h3
            style={{
              fontSize: "clamp(2.5rem, 7vw, 4rem)",
              fontWeight: 900,
              fontStyle: "normal",
              textTransform: "uppercase",
              letterSpacing: "-0.5px",
              lineHeight: 0.95,
              margin: 0,
              marginBottom: "1.2rem",
              fontFamily: "'Helvetica Neue', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            }}
          >
            {item.title}
          </h3>
          {isActive && (
            <p
              style={{
                fontSize: "11px",
                fontFamily: "'Inter', sans-serif",
                textTransform: "uppercase",
                letterSpacing: "0.7px",
                lineHeight: 1.7,
                opacity: 1,
                transform: "translateY(0)",
                transition: "all 0.8s cubic-bezier(0.23, 1, 0.32, 1)",
                marginTop: "1rem",
                fontWeight: 500,
                color: "rgba(255,255,255,0.8)"
              }}
            >
              {item.description}
            </p>
          )}
        </div>

        {/* Icon */}
        <div
          style={{
            textAlign: "right",
            fontSize: "2rem",
            opacity: isActive ? 1 : 0,
            transform: isActive ? "rotate(0deg) scale(1)" : "rotate(90deg) scale(0.5)",
            transition: "all 0.7s ease"
          }}
        >
          {item.icon}
        </div>
      </div>

      {/* The Shadow Shift Layer */}
      <div
        ref={shadowRef}
        style={{
          position: "absolute",
          inset: 0,
          border: "2px solid rgba(255, 59, 48, 0.3)",
          zIndex: 0,
          pointerEvents: "none",
          opacity: 0
        }}
      ></div>
    </div>
  );
}

// ====== MAIN HOME COMPONENT ======
export default function Home() {
  const navigate = useNavigate();
  const navRef = useRef(null);
  const heroRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.from(navRef.current, { y: -80, opacity: 0, duration: 0.8 })
      .from(ctaRef.current, { y: 60, opacity: 0, duration: 0.8 }, 0.2);
  }, []);

  return (
    <div style={{ background: "#0D0D0D", color: "#fff", overflow: "hidden" }}>
      {/* NAVBAR */}
      <nav
        ref={navRef}
        style={{
          position: "fixed",
          top: 0,
          width: "100%",
          background: "rgba(13, 13, 13, 0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255, 59, 48, 0.15)",
          zIndex: 100,
          padding: "1rem 0"
        }}
      >
        <div className="container-fluid" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 2rem" }}>
          <Link
            to="/"
            style={{
              fontSize: "1.8rem",
              fontWeight: 900,
              letterSpacing: "1.5px",
              color: "white",
              textDecoration: "none",
              fontFamily: "'Inter', sans-serif",
              textTransform: "uppercase"
            }}
          >
            SECURE<span style={{ color: "#FF3B30" }}>SHARE</span>
          </Link>
          <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
            <Link
              to="/login"
              style={{
                color: "rgba(255, 255, 255, 0.7)",
                textDecoration: "none",
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.85rem",
                letterSpacing: "0.5px",
                transition: "color 0.3s ease"
              }}
              onMouseEnter={(e) => (e.target.style.color = "#FF3B30")}
              onMouseLeave={(e) => (e.target.style.color = "rgba(255, 255, 255, 0.7)")}
            >
              LOGIN
            </Link>
            <Link
              to="/register"
              style={{
                color: "rgba(255, 255, 255, 0.7)",
                textDecoration: "none",
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.85rem",
                letterSpacing: "0.5px",
                transition: "color 0.3s ease"
              }}
              onMouseEnter={(e) => (e.target.style.color = "#FF3B30")}
              onMouseLeave={(e) => (e.target.style.color = "rgba(255, 255, 255, 0.7)")}
            >
              REGISTER
            </Link>
          </div>
        </div>
      </nav>

      {/* 3D BACKGROUND WITH SIDE MENU */}
      <div style={{ position: "relative", marginTop: "60px" }}>
        <ThreeBackground />
        <SideMenuNavigation />
      </div>

      {/* CORE COMPONENTS GRID */}
      <CoreComponentsGrid />

      {/* FOOTER */}
      <footer
        style={{
          borderTop: "1px solid rgba(255, 59, 48, 0.15)",
          padding: "3rem 2rem",
          textAlign: "center",
          background: "rgba(13, 13, 13, 0.8)",
          backdropFilter: "blur(10px)"
        }}
      >
        <p style={{ opacity: 0.6, fontSize: "0.9rem", fontFamily: "'Inter', sans-serif" }}>
          © 2026 SecureShare • Military-Grade Advanced Decentralized File Exchange
        </p>
      </footer>
    </div>
  );
}
