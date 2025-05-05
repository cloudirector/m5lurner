async function fetchFirmwareData() {
    const response = await fetch(
        'https://raw.githubusercontent.com/bmorcelli/M5Stack-json-fw/main/script/all_device_firmware.json'
        );
    const data = await response.json();
    return data;
}

function createFirmwareCard(firmware) {
    // create card div and add class for style
    const card = document.createElement('div');
    card.classList.add('firmware-card');

    // create image
    const image = document.createElement('img');
    image.loading = "lazy"; // Load images lazily
    image.src =
        `https://m5burner-cdn.m5stack.com/cover/${firmware.cover}`;
    card.appendChild(image);

    const newLine = document.createElement('div');
    newLine.classList.add('newLine');
    card.appendChild(newLine);

    // details
    const details = document.createElement('div');
    details.classList.add('firmware-details');

    // title
    const name = document.createElement('h2');
    name.textContent = `${firmware.name} (${firmware.author})`;
    details.appendChild(name);

    const description = document.createElement('p');
    description.classList.add('description');
    description.textContent = firmware.description;
    details.appendChild(description);

    const overlay = document.createElement('div');
    overlay.classList.add('overlay');
    overlay.textContent = 'Read more';
    details.appendChild(overlay);

    card.appendChild(details);

    const versionDiv = document.createElement('div');
    versionDiv.classList.add('version-div');

    // Latest Version Text
    const latestVersion = firmware.versions.reduce((latest, version) => {
        return new Date(version.published_at) > new Date(latest.published_at) ? version : latest;
    });
    const latestVersionText = document.createElement('p');
    latestVersionText.classList.add('latestVersionText');
    latestVersionText.textContent = `Latest Version: ${latestVersion.version} (${new Date(latestVersion.published_at).toLocaleDateString()})`;
    versionDiv.appendChild(latestVersionText);

    const versionSelect = document.createElement('select');
    versionSelect.classList.add('version-select');
    firmware.versions.forEach(version => {
        const option = document.createElement('option');
        option.value = version.file;
        option.textContent = version.version;
        versionSelect.appendChild(option);
    });
    versionDiv.appendChild(versionSelect);

    // Check if description is longer than allowed height
    setTimeout(() => {
        if (description.scrollHeight > description.clientHeight) {
            overlay.style.display = 'inline-block';

            overlay.addEventListener('click', () => {
                description.classList.toggle('expanded');
                overlay.textContent = description.classList.contains('expanded') ? 'Contract' :
                    'Read more';
            });
        }
    }, 100);

    const downloadLink = document.createElement('a');
    downloadLink.href =
        `https://m5burner-cdn.m5stack.com/firmware/${firmware.versions[0].file}`;
    downloadLink.target = "_blank";
    downloadLink.textContent = "Download Firmware";
    downloadLink.classList.add('download-button');
    versionDiv.appendChild(downloadLink);

    versionSelect.addEventListener('change', () => {
        downloadLink.href =
            `https://m5burner-cdn.m5stack.com/firmware/${versionSelect.value}`;
    });

    details.appendChild(versionDiv);


    return card;
}

function populateCategoryFilter(categories) {
    const filter = document.getElementById('category-filter');
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        filter.appendChild(option);
    });
}

function filterFirmwareByCategory(firmwareData, category) {
    if (category === 'all') {
        return firmwareData;
    }
    return firmwareData.filter(firmware => firmware.category === category);
}

function displayFirmwareList(firmwareData) {
    const list = document.getElementById('firmware-list');
    list.innerHTML = '';
    firmwareData.forEach(firmware => {
        const card = createFirmwareCard(firmware);
        list.appendChild(card);
    });
}

async function init() {
    const firmwareData = await fetchFirmwareData();
    const categories = [...new Set(firmwareData.map(firmware => firmware.category))];
    populateCategoryFilter(categories);

    document.getElementById('category-filter').addEventListener('change', (event) => {
        const filteredData = filterFirmwareByCategory(firmwareData, event.target.value);
        displayFirmwareList(filteredData);
    });

    displayFirmwareList(firmwareData);
}

init();