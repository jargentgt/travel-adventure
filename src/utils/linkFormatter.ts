/**
 * Utility functions for formatting links with friendly domain names
 */

interface DomainMapping {
  pattern: RegExp;
  name: string;
  icon?: string;
}

// Domain mappings with patterns and friendly names
const domainMappings: DomainMapping[] = [
  {
    pattern: /https?:\/\/(naver\.me|m\.map\.naver\.com|map\.naver\.com)/i,
    name: 'naver',
    icon: '🗺️'
  },
  {
    pattern: /https?:\/\/(tabelog\.com)/i,
    name: 'tabelog',
    icon: '🍽️'
  },
  {
    pattern: /https?:\/\/(www\.)?amazon\.(co\.jp|com|ca|co\.uk|de|fr|it|es)/i,
    name: 'amazon',
    icon: '🛒'
  },
  {
    pattern: /https?:\/\/(maps\.app\.goo\.gl|goo\.gl|maps\.google\.com|google\.com\/maps)/i,
    name: 'map',
    icon: '📍'
  },
  {
    pattern: /https?:\/\/(www\.)?booking\.com/i,
    name: 'booking',
    icon: '🏨'
  },
  {
    pattern: /https?:\/\/(www\.)?tripadvisor\.(com|jp|ca|co\.uk)/i,
    name: 'tripadvisor',
    icon: '✈️'
  },
  {
    pattern: /https?:\/\/(www\.)?klook\.com/i,
    name: 'klook',
    icon: '🎫'
  },
  {
    pattern: /https?:\/\/(www\.)?instagram\.com/i,
    name: 'instagram',
    icon: '📸'
  },
  {
    pattern: /https?:\/\/(www\.)?facebook\.com/i,
    name: 'facebook',
    icon: '📘'
  },
  {
    pattern: /https?:\/\/(www\.)?twitter\.com/i,
    name: 'twitter',
    icon: '🐦'
  },
  {
    pattern: /https?:\/\/(www\.youtube\.com|youtu\.be)/i,
    name: 'youtube',
    icon: '🎥'
  },
  {
    pattern: /https?:\/\/(www\.)?airbnb\.(com|jp|ca|co\.uk)/i,
    name: 'airbnb',
    icon: '🏠'
  },
  {
    pattern: /https?:\/\/(www\.)?expedia\.(com|jp|ca|co\.uk)/i,
    name: 'expedia',
    icon: '✈️'
  },
  {
    pattern: /https?:\/\/(www\.)?foursquare\.com/i,
    name: 'foursquare',
    icon: '📍'
  },
  {
    pattern: /https?:\/\/(www\.)?yelp\.(com|jp|ca|co\.uk)/i,
    name: 'yelp',
    icon: '⭐'
  }
];

/**
 * Get friendly domain name for a given URL
 */
export function getFriendlyDomainName(url: string): { name: string; icon?: string } {
  for (const mapping of domainMappings) {
    if (mapping.pattern.test(url)) {
      return {
        name: mapping.name,
        icon: mapping.icon
      };
    }
  }
  
  // Fallback: extract domain from URL
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace(/^www\./, '');
    const shortDomain = domain.split('.')[0];
    return {
      name: shortDomain,
      icon: '🔗'
    };
  } catch {
    return {
      name: 'link',
      icon: '🔗'
    };
  }
}

/**
 * Format text by converting URLs to clickable links with friendly names
 */
export function formatLinksInText(text: string, showIcons: boolean = true): string {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  return text.replace(urlRegex, (url) => {
    const { name, icon } = getFriendlyDomainName(url);
    const displayText = showIcons && icon ? `${icon} ${name}` : name;
    
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="link link-primary hover:text-primary-focus underline font-medium">${displayText}</a>`;
  });
}

/**
 * Extract all URLs from text and return them with metadata
 */
export function extractUrlsFromText(text: string): Array<{ url: string; name: string; icon?: string }> {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls: Array<{ url: string; name: string; icon?: string }> = [];
  let match;
  
  while ((match = urlRegex.exec(text)) !== null) {
    const url = match[1];
    const { name, icon } = getFriendlyDomainName(url);
    urls.push({ url, name, icon });
  }
  
  return urls;
} 