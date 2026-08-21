const fs = require('fs');
let code = fs.readFileSync('src/components/admin/ProductModal.js', 'utf8');

if (!code.includes('const getImagesArray =')) {
  code = code.replace(
    /const searchImage = async \(\) => {/,
    
    // Helper to get image array
    const getImagesArray = () => {
      if (Array.isArray(formData.image_urls)) return formData.image_urls;
      if (typeof formData.image_urls === 'string') {
        try { return JSON.parse(formData.image_urls); } catch(e) {}
      }
      return formData.image ? [formData.image] : [];
    };
    
    const handleAddImage = (url) => {
      const current = getImagesArray();
      if (current.length >= 5) {
        alert('Máximo 5 imágenes permitidas');
        return;
      }
      const newImages = [...current, url];
      setFormData(prev => ({ ...prev, image: newImages[0], image_urls: JSON.stringify(newImages) }));
    };

    const handleRemoveImage = (index) => {
      const current = getImagesArray();
      const newImages = current.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, image: newImages[0] || '', image_urls: JSON.stringify(newImages) }));
    };

    const searchImage = async () => {
  );
}

code = code.replace(
  /setFormData\(prev => \(\{ \.\.\.prev, image: data\.url \}\)\);/g,
  'handleAddImage(data.url);'
);

code = code.replace(
  /setFormData\(prev => \(\{ \.\.\.prev, image: img\.url \}\)\);/g,
  'handleAddImage(img.url);'
);

const oldInputHTML = '<input type="text" name="image" value={formData.image || \'\'} onChange={handleChange} placeholder="URL directa de la imagen..." style={{...inputStyle, marginTop: 0}} />';

const newInputHTML = 
<div style={{ width: '100%' }}>
  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
    {getImagesArray().map((url, idx) => (
      <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
        <img src={url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        <button type="button" onClick={() => handleRemoveImage(idx)} style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px' }}>&times;</button>
      </div>
    ))}
  </div>
  {getImagesArray().length < 5 && (
    <input type="text" placeholder="Pegar URL directa y presionar Enter..." onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (e.target.value) { handleAddImage(e.target.value); e.target.value = ''; } } }} style={{...inputStyle, marginTop: 0, width: '100%'}} />
  )}
</div>
;

code = code.replace(oldInputHTML, newInputHTML);

fs.writeFileSync('src/components/admin/ProductModal.js', code);
console.log('ProductModal updated for multiple images');
