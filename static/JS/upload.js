// Get references to the elements
const uploadButton1 = document.getElementById('uploadButton');
const fileInput = document.getElementById('fileInput');
const imagePreview = document.getElementById('imagePreview');
const changePhotoButton = document.getElementById('changePhotoButton');
const uploadOverlay = document.getElementById('upload-overlay');
const uploadViewContainer = document.getElementById('upload-view-container');

// Event listener for the "Select Image" button
uploadButton1.addEventListener('click', () => {
    fileInput.click();
});

// Event listener for file input change
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
            uploadButton1   .style.display = 'none'; // Hide "Select Image" button
            changePhotoButton.style.display = 'block'; // Show "Change Photo" button
        };
        reader.readAsDataURL(file);
    }
});

// Event listener for the "Change Photo" button
changePhotoButton.addEventListener('click', () => {
    fileInput.click(); // Reopen the file dialog
});

const showUpload = () => {
    uploadOverlay.style.display = 'block';
    uploadViewContainer.style.display = 'block';
}

const closeUploadView = () => {
    uploadOverlay.style.display = 'none';
    uploadViewContainer.style.display = 'none';
}