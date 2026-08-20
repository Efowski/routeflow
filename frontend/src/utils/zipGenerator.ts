export async function downloadBackendZip() {
  try {
    const timestamp = Date.now();
    const response = await fetch(`/belay_route_os_backend_django.zip?t=${timestamp}`);
    if (!response.ok) throw new Error('Failed to fetch backend ZIP file');
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `belay_route_os_backend_django_2026.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  } catch (err) {
    console.error('Error downloading backend zip:', err);
    alert('Błąd podczas pobierania archiwum backendu ZIP.');
  }
}

export async function downloadFrontendZip() {
  try {
    const timestamp = Date.now();
    const response = await fetch(`/belay_route_os_frontend_react.zip?t=${timestamp}`);
    if (!response.ok) throw new Error('Failed to fetch frontend ZIP file');
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `belay_route_os_frontend_react_alpine_minimal_2026.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  } catch (err) {
    console.error('Error downloading frontend zip:', err);
    alert('Błąd podczas pobierania archiwum frontendu ZIP.');
  }
}

export async function downloadAllZips() {
  await downloadFrontendZip();
  setTimeout(() => {
    downloadBackendZip();
  }, 800);
}

