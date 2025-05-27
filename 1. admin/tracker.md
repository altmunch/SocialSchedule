# Remove node_modules and lock files
rm -r -fo node_modules
rm -fo package-lock.json
rm -fo yarn.lock

# Clear Next.js cache
rm -r -fo .next

# Reinstall dependencies
npm install

# Install required dependencies
npm install -D tailwindcss@latest postcss@latest autoprefixer@latest