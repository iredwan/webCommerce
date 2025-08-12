function slugify(text) {
  return text
    .toString()
    .normalize("NFKD")                   
    .replace(/[\u0300-\u036f]/g, '')       
    .toLowerCase()
    .replace(/['",.:;!?]/g, '')
    .replace(/[^a-z0-9\u0980-\u09FF\s-]/g, '') 
    .replace(/\s+/g, '-')                   
    .replace(/-+/g, '-')                    
    .replace(/^-+|-+$/g, '');
}


async function generateUniqueSlug(name, Model) {
  let baseSlug = slugify(name);
  let slug = baseSlug;
  let count = 1;

  while (await Model.findOne({ slug })) {
    slug = `${baseSlug}-${count}`;
    count++;
  }

  return slug;
}

export { slugify, generateUniqueSlug };
