/* team.js — Team page scripts */

document.querySelectorAll('.pcard').forEach(card => {
  const placeholder = card.querySelector('.pcard-photo-placeholder');
  const photo = card.querySelector('.pcard-photo');
  if (placeholder) {
    placeholder.style.position = 'absolute';
    placeholder.style.inset = '0';
    placeholder.style.zIndex = '0';
  }
  if (photo) {
    photo.style.position = 'absolute';
    photo.style.inset = '0';
    photo.style.zIndex = '1';
    photo.addEventListener('error', () => photo.style.display = 'none');
  }
});
