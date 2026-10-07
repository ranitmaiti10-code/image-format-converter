const fileInput = document.querySelector('#fileInput');
const browseButton = document.querySelector('#browseButton');
const dropZone = document.querySelector('#dropZone');
const editor = document.querySelector('#editor');
const preview = document.querySelector('#preview');
const fileName = document.querySelector('#fileName');
const fileMeta = document.querySelector('#fileMeta');
const formatSelect = document.querySelector('#formatSelect');
const quality = document.querySelector('#quality');
const qualityValue = document.querySelector('#qualityValue');
const qualityControl = document.querySelector('#qualityControl');
const convertButton = document.querySelector('#convertButton');
const resetButton = document.querySelector('#resetButton');
const status = document.querySelector('#status');

let sourceFile = null;
let objectUrl = null;

browseButton.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => handleFiles(fileInput.files));

['dragenter', 'dragover'].forEach(eventName => {
  dropZone.addEventListener(eventName, event => {
    event.preventDefault();
    dropZone.classList.add('dragging');
  });
});
['dragleave', 'drop'].forEach(eventName => {
  dropZone.addEventListener(eventName, event => {
    event.preventDefault();
    dropZone.classList.remove('dragging');
  });
});
dropZone.addEventListener('drop', event => handleFiles(event.dataTransfer.files));
dropZone.addEventListener('keydown', event => {
  if (event.key === 'Enter' || event.key === ' ') fileInput.click();
});

quality.addEventListener('input', () => qualityValue.textContent = quality.value);
formatSelect.addEventListener('change', updateQualityVisibility);
convertButton.addEventListener('click', convertAndDownload);
resetButton.addEventListener('click', reset);

function handleFiles(files) {
  const file = files?.[0];
  if (!file) return;
  if (!['image/png', 'image/jpeg'].includes(file.type)) {
    setStatus('Please choose a PNG or JPEG image.');
    return;
  }

  sourceFile = file;
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = URL.createObjectURL(file);
  preview.src = objectUrl;
  fileName.textContent = file.name;
  fileMeta.textContent = `${formatBytes(file.size)} · ${file.type === 'image/png' ? 'PNG' : 'JPEG'}`;

  formatSelect.value = file.type === 'image/png' ? 'image/jpeg' : 'image/png';
  updateQualityVisibility();
  setStatus('Ready to convert.');
  dropZone.classList.add('hidden');
  editor.classList.remove('hidden');
}

function updateQualityVisibility() {
  qualityControl.style.display = formatSelect.value === 'image/jpeg' ? 'grid' : 'none';
}

async function convertAndDownload() {
  if (!sourceFile) return;
  convertButton.disabled = true;
  convertButton.textContent = 'Converting…';
  setStatus('');

  try {
    const image = await loadImage(objectUrl);
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext('2d');

    if (formatSelect.value === 'image/jpeg') {
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(image, 0, 0);

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error('Conversion failed.')),
        formatSelect.value,
        Number(quality.value) / 100
      );
    });

    const extension = formatSelect.value === 'image/jpeg' ? 'jpg' : 'png';
    const baseName = sourceFile.name.replace(/\.[^.]+$/, '') || 'converted-image';
    downloadBlob(blob, `${baseName}.${extension}`);
    setStatus(`Done · ${formatBytes(blob.size)}`);
  } catch (error) {
    console.error(error);
    setStatus('Could not convert this image. Try another file.');
  } finally {
    convertButton.disabled = false;
    convertButton.textContent = 'Convert & download';
  }
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not read image.'));
    image.src = url;
  });
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function reset() {
  sourceFile = null;
  fileInput.value = '';
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = null;
  preview.removeAttribute('src');
  editor.classList.add('hidden');
  dropZone.classList.remove('hidden');
  setStatus('');
}

function setStatus(message) {
  status.textContent = message;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = units[0];
  for (let i = 1; i < units.length && value >= 1024; i++) {
    value /= 1024;
    unit = units[i];
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${unit}`;
}
