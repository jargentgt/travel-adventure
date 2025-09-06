/**
 * Utility functions for handling category tags in activity descriptions
 */

/**
 * Removes category tags from activity descriptions
 * Handles various formats: [category], 「category」, 「category], [category」
 * @param description - The activity description that may contain category markers
 * @returns The cleaned description with category markers removed
 */
export function removeCategoryTags(description: string): string {
  if (!description) return description
  
  // Enhanced category patterns to match all possible formats
  const categoryPatterns = [
    /^\s*\[([^\]]+)\]\s*/, // [category] with optional whitespace
    /^\s*「([^」]+)」\s*/, // 「category」with optional whitespace  
    /^\s*「([^\]]+)\]\s*/, // 「category] with optional whitespace
    /^\s*\[([^」]+)」\s*/  // [category」with optional whitespace
  ]
  
  // Split into lines and process each line that might contain category markers
  const lines = description.split('\n')
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    let foundMatch = false
    
    // Check each pattern against the current line
    for (const pattern of categoryPatterns) {
      if (pattern.test(line)) {
        line = line.replace(pattern, '').trim()
        foundMatch = true
        break
      }
    }
    
    lines[i] = line
    
    // If we found a marker on an otherwise empty line, remove the entire line
    if (foundMatch && !line) {
      lines.splice(i, 1)
      i-- // Adjust index after removal
    }
  }
  
  // Join back and clean up any resulting empty lines
  return lines
    .filter(line => line.trim() !== '') // Remove empty lines
    .join('\n')
    .trim()
}

/**
 * Checks if a description contains category tags
 * @param description - The activity description to check
 * @returns True if category tags are found, false otherwise
 */
export function hasCategoryTags(description: string): boolean {
  if (!description) return false
  
  const categoryPatterns = [
    /\[([^\]]+)\]/, // [category]
    /「([^」]+)」/, // 「category」
    /「([^\]]+)\]/, // 「category]
    /\[([^」]+)」/  // [category」
  ]
  
  return categoryPatterns.some(pattern => pattern.test(description))
}

/**
 * Extracts category tags from a description
 * @param description - The activity description that may contain category markers
 * @returns Array of extracted category tags
 */
export function extractCategoryTags(description: string): string[] {
  if (!description) return []
  
  const categoryPatterns = [
    /\[([^\]]+)\]/g, // [category]
    /「([^」]+)」/g, // 「category」
    /「([^\]]+)\]/g, // 「category]
    /\[([^」]+)」/g  // [category」
  ]
  
  const extractedTags: string[] = []
  
  categoryPatterns.forEach(pattern => {
    let match
    while ((match = pattern.exec(description)) !== null) {
      extractedTags.push(match[1].trim())
    }
  })
  
  return Array.from(new Set(extractedTags)) // Remove duplicates
} 