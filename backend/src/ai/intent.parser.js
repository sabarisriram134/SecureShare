class IntentParser {
  constructor() {
    this.intents = {
      UPLOAD: { keywords: ['upload','add','import','submit','attach','push','store'], priority: 1 },
      DOWNLOAD: { keywords: ['download','get','retrieve','export','save','fetch','pull'], priority: 1 },
      SHARE: { keywords: ['share','grant','access','permission','give','send','invite'], priority: 1 },
      DELETE: { keywords: ['delete','remove','erase','discard','destroy','drop','clear'], priority: 1 },
      SEARCH: { keywords: ['find','search','look','locate','query','seek','browse'], priority: 2 },
      HELP: { keywords: ['help','how','what','guide','tutorial','feature','support','assist','explain'], priority: 3 }
    };
  }

  async parse(query) {
    try {
      const q = query.toLowerCase().trim();
      let intent = 'HELP';
      let conf = 0.75;
      let best = Infinity;

      for (const [name, cfg] of Object.entries(this.intents)) {
        for (const kw of cfg.keywords) {
          if (q.includes(kw)) {
            const boost = (10 - cfg.priority) * 0.05;
            const c = Math.min(0.85 + boost, 0.99);
            if (c > conf || cfg.priority < best) {
              intent = name;
              conf = c;
              best = cfg.priority;
            }
            break;
          }
        }
      }

      const entities = this.extractEntities(q);
      if (Object.values(entities).some(arr => arr.length > 0)) {
        conf = Math.min(conf + 0.05, 0.99);
      }

      return {
        type: intent,
        confidence: conf,
        entities
      };
    } catch (error) {
      console.error('Error parsing intent:', error);
      throw error;
    }
  }

  // Extract entities from query
  extractEntities(query) {
    const entities = {
      filenames: [],
      users: [],
      dates: []
    };

    // Email pattern - matches user@domain.com
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = query.match(emailPattern);
    if (emails) {
      entities.users = [...new Set(emails)]; // Remove duplicates
    }

    // Filename pattern - quoted strings or common file extensions
    const quotedPattern = /"([^"]*)"|'([^']*)'/g;
    let match;
    while ((match = quotedPattern.exec(query)) !== null) {
      const filename = match[1] || match[2];
      if (filename) {
        entities.filenames.push(filename);
      }
    }

    // Common file extensions
    const extensionPattern = /\b[\w-]+\.(pdf|doc|docx|xls|xlsx|jpg|png|gif|zip|txt|csv|ppt|pptx|mp4|mp3|mov)\b/gi;
    const filesWithExt = query.match(extensionPattern);
    if (filesWithExt) {
      entities.filenames.push(...filesWithExt);
    }

    // Date patterns - simple format like "today", "tomorrow", "Dec 25", "12/25"
    const dateKeywords = ['today', 'tomorrow', 'yesterday'];
    for (const keyword of dateKeywords) {
      if (query.toLowerCase().includes(keyword)) {
        entities.dates.push(keyword);
      }
    }

    // Date format MM/DD or DD/MM
    const datePattern = /\b(\d{1,2})\/(\d{1,2})\b/g;
    const dates = query.match(datePattern);
    if (dates) {
      entities.dates.push(...dates);
    }

    return entities;
  }
}

export default new IntentParser();
