// Fetch firmware data from external JSON source
async function fetchFirmwareData() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/bmorcelli/M5Stack-json-fw/main/script/all_device_firmware.json');
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch firmware data:', error);
        return null;
    }
}

// Create a firmware card element
function createFirmwareCard(firmware) {
    const card = document.createElement('div');
    card.className = 'firmware-card';

    const image = document.createElement('img');
    image.loading = 'lazy';
    image.src = `https://m5burner-cdn.m5stack.com/cover/${firmware.cover}`;
    card.appendChild(image);

    card.appendChild(Object.assign(document.createElement('div'), { className: 'newLine' }));

    const details = document.createElement('div');
    details.className = 'firmware-details';

    const title = document.createElement('h2');
    title.textContent = `${firmware.name} (${firmware.author})`;
    details.appendChild(title);

    const description = document.createElement('p');
    description.className = 'description';
    description.textContent = firmware.description;
    details.appendChild(description);

    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.textContent = 'Read more';
    details.appendChild(overlay);

    card.appendChild(details);

    const versionDiv = document.createElement('div');
    versionDiv.className = 'version-div';

    // Get the latest version
    const latestVersion = firmware.versions.reduce((latest, current) =>
        new Date(current.published_at) > new Date(latest.published_at) ? current : latest
    );

    const latestVersionText = document.createElement('p');
    latestVersionText.className = 'latestVersionText';
    latestVersionText.textContent = `Latest Version: ${latestVersion.version} (${new Date(latestVersion.published_at).toLocaleDateString()})`;
    versionDiv.appendChild(latestVersionText);

    // Create version selector
    const versionSelect = document.createElement('select');
    versionSelect.className = 'version-select';

    firmware.versions.forEach(version => {
        const option = document.createElement('option');
        option.value = version.file;
        option.textContent = version.version;
        versionSelect.appendChild(option);
    });
    versionDiv.appendChild(versionSelect);

    // Firmware download link
    const downloadLink = document.createElement('a');
    downloadLink.href = `https://m5burner-cdn.m5stack.com/firmware/${firmware.versions[0].file}`;
    downloadLink.target = '_blank';
    downloadLink.className = 'download-button';
    downloadLink.textContent = 'Download Firmware';
    versionDiv.appendChild(downloadLink);

    // Update download link on version change
    versionSelect.addEventListener('change', () => {
        downloadLink.href = `https://m5burner-cdn.m5stack.com/firmware/${versionSelect.value}`;
    });

    details.appendChild(versionDiv);

    // Add overlay toggle if description overflows
    setTimeout(() => {
        if (description.scrollHeight > description.clientHeight) {
            overlay.style.display = 'inline-block';
            overlay.addEventListener('click', () => {
                description.classList.toggle('expanded');
                overlay.textContent = description.classList.contains('expanded') ? 'Contract' : 'Read more';
            });
        }
    }, 100);

    return card;
}

// Populate dropdown with unique categories
function populateCategoryFilter(categories) {
    const filter = document.getElementById('category-filter');
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        filter.appendChild(option);
    });
}

// Filter firmware list by category
function filterFirmwareByCategory(firmwares, selectedCategory) {
    return selectedCategory === 'all'
        ? firmwares
        : firmwares.filter(firmware => firmware.category === selectedCategory);
}

// Render firmware cards in the UI
function displayFirmwareList(firmwares) {
    const list = document.getElementById('firmware-list');
    list.innerHTML = '';
    firmwares.forEach(firmware => list.appendChild(createFirmwareCard(firmware)));
}

// Initialize application
async function init() {
    const firmwareData = await fetchFirmwareData();

    if (!firmwareData) {
        alert('Error retrieving firmware list.');
        return;
    }

    const categories = Array.from(new Set(firmwareData.map(fw => fw.category)));
    populateCategoryFilter(categories);

    document.getElementById('category-filter').addEventListener('change', event => {
        const filtered = filterFirmwareByCategory(firmwareData, event.target.value);
        displayFirmwareList(filtered);
    });

    displayFirmwareList(firmwareData);
}

init();
