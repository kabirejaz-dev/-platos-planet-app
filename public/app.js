async function loadPlanet() {
  try {
    const res = await fetch('/api/planet');
    const data = await res.json();
    document.getElementById('name').textContent = data.name;
    document.getElementById('desc').textContent = data.description;
    const ul = document.getElementById('features');
    ul.innerHTML = '';
    data.features.forEach(f => {
      const li = document.createElement('li');
      li.textContent = f;
      ul.appendChild(li);
    });
  } catch (err) {
    document.getElementById('name').textContent = 'Error';
    document.getElementById('desc').textContent = '' + err;
  }
}

window.addEventListener('load', loadPlanet);
