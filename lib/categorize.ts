export interface Category {
  category: string
  subcategory: string
  path: string
}

export function categorizeTopic(topic: string): Category {
  const lowerTopic = topic.toLowerCase()
  
  // Animal categories
  if (lowerTopic.includes('cat') || lowerTopic.includes('kitten')) {
    return { category: 'animal', subcategory: 'cats', path: '/animal/cats' }
  }
  if (lowerTopic.includes('dog') || lowerTopic.includes('puppy')) {
    return { category: 'animal', subcategory: 'dogs', path: '/animal/dogs' }
  }
  if (lowerTopic.includes('bird') || lowerTopic.includes('parrot') || lowerTopic.includes('eagle')) {
    return { category: 'animal', subcategory: 'birds', path: '/animal/birds' }
  }
  if (lowerTopic.includes('fish') || lowerTopic.includes('shark') || lowerTopic.includes('whale')) {
    return { category: 'animal', subcategory: 'fish', path: '/animal/fish' }
  }
  
  // Nature categories
  if (lowerTopic.includes('tree') || lowerTopic.includes('forest')) {
    return { category: 'nature', subcategory: 'trees', path: '/nature/trees' }
  }
  if (lowerTopic.includes('flower') || lowerTopic.includes('rose') || lowerTopic.includes('tulip')) {
    return { category: 'nature', subcategory: 'flowers', path: '/nature/flowers' }
  }
  if (lowerTopic.includes('mountain') || lowerTopic.includes('landscape')) {
    return { category: 'nature', subcategory: 'landscapes', path: '/nature/landscapes' }
  }
  
  // Object categories
  if (lowerTopic.includes('car') || lowerTopic.includes('vehicle') || lowerTopic.includes('truck')) {
    return { category: 'object', subcategory: 'vehicles', path: '/object/vehicles' }
  }
  if (lowerTopic.includes('house') || lowerTopic.includes('building')) {
    return { category: 'object', subcategory: 'buildings', path: '/object/buildings' }
  }
  if (lowerTopic.includes('food') || lowerTopic.includes('fruit') || lowerTopic.includes('cake')) {
    return { category: 'object', subcategory: 'food', path: '/object/food' }
  }
  
  // People categories
  if (lowerTopic.includes('face') || lowerTopic.includes('portrait') || lowerTopic.includes('person')) {
    return { category: 'people', subcategory: 'portraits', path: '/people/portraits' }
  }
  if (lowerTopic.includes('cartoon') || lowerTopic.includes('character')) {
    return { category: 'people', subcategory: 'characters', path: '/people/characters' }
  }
  
  // Default
  return { category: 'other', subcategory: 'misc', path: '/other/misc' }
}