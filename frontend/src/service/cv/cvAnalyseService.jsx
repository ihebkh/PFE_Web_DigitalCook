export async function analyseCv(file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch('http://localhost:8000/analyse/analyse-cv', {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error("Erreur lors de l'analyse du CV");
  return await response.json();
} 