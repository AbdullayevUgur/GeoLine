/**
 * Modal management for content creation and editing
 */

let currentEditId = null;

/**
 * Create a Bootstrap modal
 */
function createModal(modalId, title, bodyContent, footerContent = '') {
    let modalsContainer = document.getElementById('modals-container');
    if (!modalsContainer) {
        // Create container if it doesn't exist
        modalsContainer = document.createElement('div');
        modalsContainer.id = 'modals-container';
        document.body.appendChild(modalsContainer);
    }

    // Remove existing modal if any
    const existing = document.getElementById(modalId);
    if (existing) {
        existing.remove();
    }

    const modalHTML = `
        <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="${modalId}Label">${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Bağla"></button>
                    </div>
                    <div class="modal-body">
                        ${bodyContent}
                    </div>
                    <div class="modal-footer">
                        ${footerContent}
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Ləğv et</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    modalsContainer.insertAdjacentHTML('beforeend', modalHTML);
    const modalElement = document.getElementById(modalId);
    return new bootstrap.Modal(modalElement);
}

/**
 * Show image preview
 */
function showImagePreview(input, previewId) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById(previewId);
            if (preview) {
                preview.src = e.target.result;
                preview.style.display = 'block';
            }
        };
        reader.readAsDataURL(input.files[0]);
    }
}

/**
 * Carousel Modal
 */
function openCarouselModal(id = null) {
    currentEditId = id;
    const isEdit = id !== null;
    
    let formData = {};
    if (isEdit) {
        // Load existing data (simplified - in real app, fetch from API)
        formData = {};
    }

    const bodyContent = `
        <form id="carousel-form">
            <div class="mb-3">
                <label for="carousel-title" class="form-label">Başlıq *</label>
                <input type="text" class="form-control" id="carousel-title" value="${formData.title || ''}" required>
            </div>
            <div class="mb-3">
                <label for="carousel-subtitle" class="form-label">Alt başlıq</label>
                <input type="text" class="form-control" id="carousel-subtitle" value="${formData.subtitle || ''}">
            </div>
            <div class="mb-3">
                <label for="carousel-image" class="form-label">Şəkil ${isEdit ? '(cari şəkli saxlamaq üçün boş buraxın)' : '*'} </label>
                <input type="file" class="form-control" id="carousel-image" accept="image/*" ${isEdit ? '' : 'required'}>
                <img id="carousel-preview" src="" style="display:none; max-width:100%; margin-top:10px; border-radius:4px;">
            </div>
            <div class="mb-3">
                <label for="carousel-button-text" class="form-label">Düymə mətni</label>
                <input type="text" class="form-control" id="carousel-button-text" value="${formData.button_text || ''}">
            </div>
            <div class="mb-3">
                <label for="carousel-button-link" class="form-label">Düymə linki</label>
                <input type="url" class="form-control" id="carousel-button-link" value="${formData.button_link || ''}">
            </div>
            <div class="mb-3">
                <label for="carousel-order" class="form-label">Sıra</label>
                <input type="number" class="form-control" id="carousel-order" value="${formData.order || 0}">
            </div>
            <div class="mb-3">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="carousel-active" ${formData.is_active !== false ? 'checked' : ''}>
                    <label class="form-check-label" for="carousel-active">Aktiv</label>
                </div>
            </div>
        </form>
    `;

    const footerContent = `
        <button type="button" class="btn btn-primary" onclick="saveCarousel()">
            <i class="fas fa-save"></i> ${isEdit ? 'Yenilə' : 'Yarat'}
        </button>
    `;

    const modal = createModal('carouselModal', isEdit ? 'Karusel Slaydını Redaktə Et' : 'Karusel Slaydı Əlavə Et', bodyContent, footerContent);
    
    // Image preview
    document.getElementById('carousel-image').addEventListener('change', function(e) {
        showImagePreview(e.target, 'carousel-preview');
    });

    modal.show();
}

async function saveCarousel() {
    const form = document.getElementById('carousel-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const formData = new FormData();
    formData.append('title', document.getElementById('carousel-title').value);
    formData.append('subtitle', document.getElementById('carousel-subtitle').value);
    formData.append('button_text', document.getElementById('carousel-button-text').value);
    formData.append('button_link', document.getElementById('carousel-button-link').value);
    formData.append('order', document.getElementById('carousel-order').value);
    formData.append('is_active', document.getElementById('carousel-active').checked);

    const imageInput = document.getElementById('carousel-image');
    if (imageInput.files[0]) {
        formData.append('image', imageInput.files[0]);
    }

    try {
        if (currentEditId) {
            if (imageInput.files[0]) {
                await api.updateCarouselSlideImage(currentEditId, formData);
            }
            const updateData = {
                title: formData.get('title'),
                subtitle: formData.get('subtitle'),
                button_text: formData.get('button_text'),
                button_link: formData.get('button_link'),
                order: parseInt(formData.get('order')),
                is_active: formData.get('is_active') === 'true'
            };
            await api.updateCarouselSlide(currentEditId, updateData);
            showSuccess('Karusel slaydı uğurla yeniləndi');
        } else {
            await api.createCarouselSlide(formData);
            showSuccess('Karusel slaydı uğurla yaradıldı');
        }
        
        bootstrap.Modal.getInstance(document.getElementById('carouselModal')).hide();
        await loadCarouselSlides();
    } catch (error) {
        showError('Saxlamaq mümkün olmadı: ' + error.message);
    }
}

async function editCarouselSlide(id) {
    try {
        const slide = await api.getCarouselSlide(id);
        openCarouselModal(id);
        // Populate form with existing data
        setTimeout(() => {
            document.getElementById('carousel-title').value = slide.title;
            document.getElementById('carousel-subtitle').value = slide.subtitle || '';
            document.getElementById('carousel-button-text').value = slide.button_text || '';
            document.getElementById('carousel-button-link').value = slide.button_link || '';
            document.getElementById('carousel-order').value = slide.order;
            document.getElementById('carousel-active').checked = slide.is_active;
            
            if (slide.image_path) {
                const imageUrl = slide.image_path.startsWith('http') 
                    ? slide.image_path 
                    : `http://localhost:8000/uploads/${slide.image_path}`;
                document.getElementById('carousel-preview').src = imageUrl;
                document.getElementById('carousel-preview').style.display = 'block';
            }
        }, 100);
    } catch (error) {
        showError('Karusel slaydı yüklənə bilmədi: ' + error.message);
    }
}

/**
 * Service Modal
 */
function openServiceModal(id = null) {
    currentEditId = id;
    const isEdit = id !== null;

    const bodyContent = `
        <form id="service-form">
            <div class="mb-3">
                <label for="service-title" class="form-label">Başlıq *</label>
                <input type="text" class="form-control" id="service-title" required>
            </div>
            <div class="mb-3">
                <label for="service-image" class="form-label">Şəkil ${isEdit ? '(cari şəkli saxlamaq üçün boş buraxın)' : '(istəyə bağlı)'} </label>
                <input type="file" class="form-control" id="service-image" accept="image/*">
                <small class="form-text text-muted">${isEdit ? 'Cari şəkli saxlamaq üçün boş buraxın' : 'İstəyə bağlı: Təmin edilməzsə və video yüklənərsə, video-dan avtomatik olaraq thumbnail yaradılacaq'}</small>
                <img id="service-preview" src="" style="display:none; max-width:100%; margin-top:10px; border-radius:4px;">
            </div>
            <div class="mb-3">
                <label for="service-images" class="form-label">Çoxlu Şəkillər (Carousel üçün)</label>
                <input type="file" class="form-control" id="service-images" accept="image/*" multiple>
                <small class="form-text text-muted">Bir neçə şəkil seçin - onlar carousel kimi göstəriləcək. Əgər çoxlu şəkil seçilsə, birinci şəkil əsas şəkil kimi istifadə olunacaq.</small>
                <div id="service-images-preview" style="margin-top:10px; display:flex; flex-wrap:wrap; gap:10px;"></div>
                <div id="service-images-existing" style="margin-top:10px; display:flex; flex-wrap:wrap; gap:10px;"></div>
            </div>
            <div class="mb-3">
                <label class="form-label">Video</label>
                <div class="mb-2">
                    <label for="service-video-file" class="form-label small">Video Faylı Yüklə</label>
                    <input type="file" class="form-control" id="service-video-file" accept="video/*">
                    <small class="form-text text-muted">Dəstəklənən formatlar: MP4, WebM, OGG, MOV, AVI (maksimum 100MB). Şəkil təmin edilməzsə, avtomatik olaraq thumbnail yaradılacaq.</small>
                </div>
                <div class="text-center my-2">
                    <strong>VƏ YA</strong>
                </div>
                <div>
                    <label for="service-video-url" class="form-label small">Video URL (YouTube/Vimeo)</label>
                    <input type="url" class="form-control" id="service-video-url" placeholder="https://www.youtube.com/embed/... və ya https://player.vimeo.com/video/...">
                    <small class="form-text text-muted">YouTube və ya Vimeo embed URL daxil edin</small>
                </div>
                <div id="service-video-preview" style="display:none; margin-top:10px;">
                    <video controls style="max-width:100%; border-radius:4px;" id="service-video-preview-player"></video>
                </div>
            </div>
            <div class="mb-3">
                <label for="service-order" class="form-label">Sıra</label>
                <input type="number" class="form-control" id="service-order" value="0">
            </div>
            <div class="mb-3">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="service-active" checked>
                    <label class="form-check-label" for="service-active">Aktiv</label>
                </div>
            </div>
        </form>
    `;

    const footerContent = `
        <button type="button" class="btn btn-primary" onclick="saveService()">
            <i class="fas fa-save"></i> ${isEdit ? 'Yenilə' : 'Yarat'}
        </button>
    `;

    const modal = createModal('serviceModal', isEdit ? 'Xidməti Redaktə Et' : 'Xidmət Əlavə Et', bodyContent, footerContent);
    
    // Store uploaded images for this service
    let uploadedImages = [];
    let existingImages = [];
    
    document.getElementById('service-image').addEventListener('change', function(e) {
        showImagePreview(e.target, 'service-preview');
    });
    
    // Handle multiple images upload
    const imagesInput = document.getElementById('service-images');
    if (imagesInput) {
        imagesInput.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            const previewContainer = document.getElementById('service-images-preview');
            if (!previewContainer) return;
            
            previewContainer.innerHTML = '';
            console.log('Selected files:', files.length);
            
            if (files.length === 0) {
                uploadedImages = [];
                return;
            }
            
            files.forEach((file, index) => {
                if (!file.type.startsWith('image/')) {
                    console.warn('Skipping non-image file:', file.name);
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    const imgDiv = document.createElement('div');
                    imgDiv.style.position = 'relative';
                    imgDiv.style.width = '100px';
                    imgDiv.style.height = '100px';
                    imgDiv.innerHTML = `
                        <img src="${e.target.result}" style="width:100%; height:100%; object-fit:cover; border-radius:4px; border:2px solid #ddd;">
                        <button type="button" class="btn btn-sm btn-danger" style="position:absolute; top:-5px; right:-5px; border-radius:50%; width:20px; height:20px; padding:0; line-height:1;" onclick="removeImagePreview(${index})">×</button>
                    `;
                    previewContainer.appendChild(imgDiv);
                };
                reader.onerror = function() {
                    console.error('Error reading file:', file.name);
                };
                reader.readAsDataURL(file);
            });
            
            uploadedImages = files;
            console.log('Stored uploadedImages:', uploadedImages.length);
        });
    }
    
    // Function to remove image from preview
    window.removeImagePreview = function(index) {
        uploadedImages.splice(index, 1);
        const input = document.getElementById('service-images');
        const dt = new DataTransfer();
        uploadedImages.forEach(file => dt.items.add(file));
        input.files = dt.files;
        
        // Refresh preview
        const event = new Event('change', { bubbles: true });
        input.dispatchEvent(event);
    };
    
    // Handle video file preview
    document.getElementById('service-video-file').addEventListener('change', function(e) {
        const file = e.target.files[0];
        const previewDiv = document.getElementById('service-video-preview');
        const previewPlayer = document.getElementById('service-video-preview-player');
        const urlInput = document.getElementById('service-video-url');
        
        if (file) {
            // Clear URL input when file is selected
            urlInput.value = '';
            const videoUrl = URL.createObjectURL(file);
            previewPlayer.src = videoUrl;
            previewDiv.style.display = 'block';
        } else {
            previewDiv.style.display = 'none';
            previewPlayer.src = '';
        }
    });
    
    // Handle URL input - hide file preview when URL is entered
    document.getElementById('service-video-url').addEventListener('input', function(e) {
        if (e.target.value.trim()) {
            document.getElementById('service-video-file').value = '';
            document.getElementById('service-video-preview').style.display = 'none';
        }
    });

    modal.show();
}

async function saveService() {
    const form = document.getElementById('service-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const formData = new FormData();
    formData.append('title', document.getElementById('service-title').value);
    formData.append('order', document.getElementById('service-order').value);
    formData.append('is_active', document.getElementById('service-active').checked);
    
    // Handle video: file upload takes priority over URL
    const videoFileInput = document.getElementById('service-video-file');
    const videoUrlInput = document.getElementById('service-video-url');
    const videoFile = videoFileInput.files[0];
    const videoUrl = videoUrlInput.value.trim();
    
    if (videoFile) {
        formData.append('video_file', videoFile);
    } else if (videoUrl) {
        formData.append('video_url', videoUrl);
    }

    const imageInput = document.getElementById('service-image');
    if (imageInput.files[0]) {
        formData.append('image', imageInput.files[0]);
    }
    
    // Handle multiple images: collect existing + upload new ones
    const imagesInput = document.getElementById('service-images');
    const imageFiles = Array.from(imagesInput.files);
    let imagePaths = [];
    
    // If editing, include existing images
    const existingImagesContainer = document.getElementById('service-images-existing');
    if (existingImagesContainer) {
        const existingImgElements = existingImagesContainer.querySelectorAll('img[data-path]');
        existingImgElements.forEach(img => {
            const path = img.getAttribute('data-path');
            if (path) imagePaths.push(path);
        });
    }
    
    // Upload new images using the dedicated upload endpoint
    if (imageFiles.length > 0) {
        try {
            const uploadFormData = new FormData();
            imageFiles.forEach(file => {
                uploadFormData.append('images', file);
            });
            
            const uploadedPaths = await api.uploadServiceImages(uploadFormData);
            if (uploadedPaths && Array.isArray(uploadedPaths)) {
                imagePaths = imagePaths.concat(uploadedPaths);
            }
        } catch (error) {
            console.error('Error uploading images:', error);
            alert('Şəkillər yüklənərkən xəta baş verdi: ' + error.message);
        }
    }
    
    // If we have image paths, add them as JSON
    if (imagePaths.length > 0) {
        formData.append('images_json', JSON.stringify(imagePaths));
    }

    try {
        if (currentEditId) {
            // Handle image update separately if needed
            if (imageInput.files[0]) {
                await api.updateServiceImage(currentEditId, formData);
            }
            
            // Handle multiple images update
            if (imagePaths.length > 0) {
                const imagesFormData = new FormData();
                imagesFormData.append('images_json', JSON.stringify(imagePaths));
                await api.updateServiceImages(currentEditId, imagesFormData);
            }
            
            // Handle video update separately if needed
            if (videoFile || videoUrl || (!videoFile && !videoUrl)) {
                const videoFormData = new FormData();
                if (videoFile) {
                    videoFormData.append('video_file', videoFile);
                } else if (videoUrl) {
                    videoFormData.append('video_url', videoUrl);
                } else {
                    // Empty string to remove video
                    videoFormData.append('video_url', '');
                }
                await api.updateServiceVideo(currentEditId, videoFormData);
            }
            
            // Update other fields
            const updateData = {
                title: formData.get('title'),
                order: parseInt(formData.get('order')),
                is_active: formData.get('is_active') === 'true'
            };
            await api.updateService(currentEditId, updateData);
            showSuccess('Xidmət uğurla yeniləndi');
        } else {
            // For new services, images_json is already in formData
            await api.createService(formData);
            showSuccess('Xidmət uğurla yaradıldı');
        }
        
        bootstrap.Modal.getInstance(document.getElementById('serviceModal')).hide();
        await loadServices();
    } catch (error) {
        showError('Saxlamaq mümkün olmadı: ' + error.message);
    }
}

async function editService(id) {
    try {
        const service = await api.getService(id);
        openServiceModal(id);
        setTimeout(() => {
            document.getElementById('service-title').value = service.title;
            document.getElementById('service-order').value = service.order;
            document.getElementById('service-active').checked = service.is_active;
            
            // Handle video: show preview if it's a local file, or populate URL if it's external
            if (service.video_url) {
                if (service.video_url.startsWith('http://') || service.video_url.startsWith('https://')) {
                    // External URL
                    document.getElementById('service-video-url').value = service.video_url;
                } else {
                    // Local file - show preview
                    const videoUrl = service.video_url.startsWith('http') 
                        ? service.video_url 
                        : `http://localhost:8000/uploads/${service.video_url}`;
                    const previewDiv = document.getElementById('service-video-preview');
                    const previewPlayer = document.getElementById('service-video-preview-player');
                    if (previewDiv && previewPlayer) {
                        previewPlayer.src = videoUrl;
                        previewDiv.style.display = 'block';
                    }
                }
            }
            
            if (service.image_path) {
                const imageUrl = service.image_path.startsWith('http') 
                    ? service.image_path 
                    : `http://localhost:8000/uploads/${service.image_path}`;
                document.getElementById('service-preview').src = imageUrl;
                document.getElementById('service-preview').style.display = 'block';
            }
            
            // Handle multiple images
            if (service.images) {
                try {
                    const images = JSON.parse(service.images);
                    if (Array.isArray(images) && images.length > 0) {
                        const existingContainer = document.getElementById('service-images-existing');
                        if (existingContainer) {
                            existingContainer.innerHTML = '';
                            images.forEach((imgPath, index) => {
                                const imageUrl = imgPath.startsWith('http') 
                                    ? imgPath 
                                    : `http://localhost:8000/uploads/${imgPath}`;
                                const imgDiv = document.createElement('div');
                                imgDiv.style.position = 'relative';
                                imgDiv.style.width = '100px';
                                imgDiv.style.height = '100px';
                                imgDiv.innerHTML = `
                                    <img src="${imageUrl}" data-path="${imgPath}" style="width:100%; height:100%; object-fit:cover; border-radius:4px; border:2px solid #ddd;">
                                    <button type="button" class="btn btn-sm btn-danger" style="position:absolute; top:-5px; right:-5px; border-radius:50%; width:20px; height:20px; padding:0; line-height:1;" onclick="removeExistingImage('${imgPath}', ${index})">×</button>
                                `;
                                existingContainer.appendChild(imgDiv);
                            });
                            existingContainer.style.display = 'flex';
                        }
                    }
                } catch (e) {
                    console.error('Error parsing images JSON:', e);
                }
            }
        }, 100);
        
        // Function to remove existing image
        window.removeExistingImage = function(path, index) {
            const existingContainer = document.getElementById('service-images-existing');
            if (existingContainer) {
                const imgElements = existingContainer.querySelectorAll(`img[data-path="${path}"]`);
                imgElements.forEach(img => img.closest('div').remove());
            }
        };
    } catch (error) {
        showError('Xidmət yüklənə bilmədi: ' + error.message);
    }
}

/**
 * Portfolio Modal
 */
function openPortfolioModal(id = null) {
    currentEditId = id;
    const isEdit = id !== null;

    const bodyContent = `
        <form id="portfolio-form">
            <div class="mb-3">
                <label for="portfolio-title" class="form-label">Başlıq *</label>
                <input type="text" class="form-control" id="portfolio-title" required>
            </div>
            <div class="mb-3">
                <label for="portfolio-status" class="form-label">Status *</label>
                <select class="form-control" id="portfolio-status" required>
                    <option value="completed">Tamamlanıb</option>
                    <option value="in_progress">Davam edir</option>
                    <option value="future">Gələcək</option>
                </select>
            </div>
            <div class="mb-3">
                <label for="portfolio-image" class="form-label">Şəkil ${isEdit ? '(cari şəkli saxlamaq üçün boş buraxın)' : '*'} </label>
                <input type="file" class="form-control" id="portfolio-image" accept="image/*" ${isEdit ? '' : 'required'}>
                <img id="portfolio-preview" src="" style="display:none; max-width:100%; margin-top:10px; border-radius:4px;">
            </div>
            <div class="mb-3">
                <label for="portfolio-order" class="form-label">Sıra</label>
                <input type="number" class="form-control" id="portfolio-order" value="0">
            </div>
            <div class="mb-3">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="portfolio-active" checked>
                    <label class="form-check-label" for="portfolio-active">Aktiv</label>
                </div>
            </div>
        </form>
    `;

    const footerContent = `
        <button type="button" class="btn btn-primary" onclick="savePortfolio()">
            <i class="fas fa-save"></i> ${isEdit ? 'Yenilə' : 'Yarat'}
        </button>
    `;

    const modal = createModal('portfolioModal', isEdit ? 'Portfolyo Layihəsini Redaktə Et' : 'Portfolyo Layihəsi Əlavə Et', bodyContent, footerContent);
    
    document.getElementById('portfolio-image').addEventListener('change', function(e) {
        showImagePreview(e.target, 'portfolio-preview');
    });

    modal.show();
}

async function savePortfolio() {
    const form = document.getElementById('portfolio-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const formData = new FormData();
    formData.append('title', document.getElementById('portfolio-title').value);
    formData.append('status', document.getElementById('portfolio-status').value);
    formData.append('order', document.getElementById('portfolio-order').value);
    formData.append('is_active', document.getElementById('portfolio-active').checked);

    const imageInput = document.getElementById('portfolio-image');
    if (imageInput.files[0]) {
        formData.append('image', imageInput.files[0]);
    }

    try {
        if (currentEditId) {
            if (imageInput.files[0]) {
                await api.updatePortfolioProjectImage(currentEditId, formData);
            }
            const updateData = {
                title: formData.get('title'),
                status: formData.get('status'),
                order: parseInt(formData.get('order')),
                is_active: formData.get('is_active') === 'true'
            };
            await api.updatePortfolioProject(currentEditId, updateData);
            showSuccess('Portfolyo layihəsi uğurla yeniləndi');
        } else {
            await api.createPortfolioProject(formData);
            showSuccess('Portfolyo layihəsi uğurla yaradıldı');
        }
        
        bootstrap.Modal.getInstance(document.getElementById('portfolioModal')).hide();
        await loadPortfolioProjects();
    } catch (error) {
        showError('Saxlamaq mümkün olmadı: ' + error.message);
    }
}

async function editPortfolioProject(id) {
    try {
        const project = await api.getPortfolioProject(id);
        openPortfolioModal(id);
        setTimeout(() => {
            document.getElementById('portfolio-title').value = project.title;
            document.getElementById('portfolio-status').value = project.status;
            document.getElementById('portfolio-order').value = project.order;
            document.getElementById('portfolio-active').checked = project.is_active;
            
            if (project.image_path) {
                const imageUrl = project.image_path.startsWith('http') 
                    ? project.image_path 
                    : `http://localhost:8000/uploads/${project.image_path}`;
                document.getElementById('portfolio-preview').src = imageUrl;
                document.getElementById('portfolio-preview').style.display = 'block';
            }
        }, 100);
    } catch (error) {
        showError('Portfolyo layihəsi yüklənə bilmədi: ' + error.message);
    }
}

/**
 * Blog Modal
 */
function openBlogModal(id = null) {
    currentEditId = id;
    const isEdit = id !== null;

    const bodyContent = `
        <form id="blog-form">
            <div class="mb-3">
                <label for="blog-title" class="form-label">Başlıq *</label>
                <input type="text" class="form-control" id="blog-title" required>
            </div>
            <div class="mb-3">
                <label for="blog-excerpt" class="form-label">Xülasə</label>
                <textarea class="form-control" id="blog-excerpt" rows="3"></textarea>
            </div>
            <div class="mb-3">
                <label for="blog-content" class="form-label">Məzmun</label>
                <textarea class="form-control" id="blog-content" rows="6"></textarea>
            </div>
            <div class="mb-3">
                <label for="blog-image" class="form-label">Şəkil ${isEdit ? '(cari şəkli saxlamaq üçün boş buraxın)' : ''} </label>
                <input type="file" class="form-control" id="blog-image" accept="image/*">
                <img id="blog-preview" src="" style="display:none; max-width:100%; margin-top:10px; border-radius:4px;">
            </div>
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="blog-author" class="form-label">Müəllif</label>
                        <input type="text" class="form-control" id="blog-author">
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="blog-category" class="form-label">Kateqoriya</label>
                        <input type="text" class="form-control" id="blog-category">
                    </div>
                </div>
            </div>
            <div class="mb-3">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="blog-published">
                    <label class="form-check-label" for="blog-published">Dərc olunub</label>
                </div>
            </div>
        </form>
    `;

    const footerContent = `
        <button type="button" class="btn btn-primary" onclick="saveBlog()">
            <i class="fas fa-save"></i> ${isEdit ? 'Yenilə' : 'Yarat'}
        </button>
    `;

    const modal = createModal('blogModal', isEdit ? 'Blog Yazısını Redaktə Et' : 'Blog Yazısı Əlavə Et', bodyContent, footerContent);
    
    document.getElementById('blog-image').addEventListener('change', function(e) {
        showImagePreview(e.target, 'blog-preview');
    });

    modal.show();
}

async function saveBlog() {
    const form = document.getElementById('blog-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const formData = new FormData();
    formData.append('title', document.getElementById('blog-title').value);
    formData.append('excerpt', document.getElementById('blog-excerpt').value);
    formData.append('content', document.getElementById('blog-content').value);
    formData.append('author', document.getElementById('blog-author').value);
    formData.append('category', document.getElementById('blog-category').value);
    formData.append('is_published', document.getElementById('blog-published').checked);

    const imageInput = document.getElementById('blog-image');
    if (imageInput.files[0]) {
        formData.append('image', imageInput.files[0]);
    }

    try {
        if (currentEditId) {
            if (imageInput.files[0]) {
                await api.updateBlogPostImage(currentEditId, formData);
            }
            const updateData = {
                title: formData.get('title'),
                excerpt: formData.get('excerpt'),
                content: formData.get('content'),
                author: formData.get('author'),
                category: formData.get('category'),
                is_published: formData.get('is_published') === 'true'
            };
            await api.updateBlogPost(currentEditId, updateData);
            showSuccess('Blog yazısı uğurla yeniləndi');
        } else {
            await api.createBlogPost(formData);
            showSuccess('Blog yazısı uğurla yaradıldı');
        }
        
        bootstrap.Modal.getInstance(document.getElementById('blogModal')).hide();
        await loadBlogPosts();
    } catch (error) {
        showError('Saxlamaq mümkün olmadı: ' + error.message);
    }
}

async function editBlogPost(id) {
    try {
        const post = await api.getBlogPost(id);
        openBlogModal(id);
        setTimeout(() => {
            document.getElementById('blog-title').value = post.title;
            document.getElementById('blog-excerpt').value = post.excerpt || '';
            document.getElementById('blog-content').value = post.content || '';
            document.getElementById('blog-author').value = post.author || '';
            document.getElementById('blog-category').value = post.category || '';
            document.getElementById('blog-published').checked = post.is_published;
            
            if (post.image_path) {
                const imageUrl = post.image_path.startsWith('http') 
                    ? post.image_path 
                    : `http://localhost:8000/uploads/${post.image_path}`;
                document.getElementById('blog-preview').src = imageUrl;
                document.getElementById('blog-preview').style.display = 'block';
            }
        }, 100);
    } catch (error) {
        showError('Blog yazısı yüklənə bilmədi: ' + error.message);
    }
}

/**
 * FAQ Modal
 */
function openFAQModal(id = null) {
    currentEditId = id;
    const isEdit = id !== null;

    const bodyContent = `
        <form id="faq-form">
            <div class="mb-3">
                <label for="faq-question" class="form-label">Sual *</label>
                <input type="text" class="form-control" id="faq-question" required>
            </div>
            <div class="mb-3">
                <label for="faq-answer" class="form-label">Cavab *</label>
                <textarea class="form-control" id="faq-answer" rows="4" required></textarea>
            </div>
            <div class="mb-3">
                <label for="faq-order" class="form-label">Sıra</label>
                <input type="number" class="form-control" id="faq-order" value="0">
            </div>
            <div class="mb-3">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="faq-active" checked>
                    <label class="form-check-label" for="faq-active">Aktiv</label>
                </div>
            </div>
        </form>
    `;

    const footerContent = `
        <button type="button" class="btn btn-primary" onclick="saveFAQ()">
            <i class="fas fa-save"></i> ${isEdit ? 'Yenilə' : 'Yarat'}
        </button>
    `;

    const modal = createModal('faqModal', isEdit ? 'Sualı Redaktə Et' : 'Sual Əlavə Et', bodyContent, footerContent);
    modal.show();
}

async function saveFAQ() {
    const form = document.getElementById('faq-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const data = {
        question: document.getElementById('faq-question').value,
        answer: document.getElementById('faq-answer').value,
        order: parseInt(document.getElementById('faq-order').value),
        is_active: document.getElementById('faq-active').checked
    };

    try {
        if (currentEditId) {
            await api.updateFAQ(currentEditId, data);
            showSuccess('Sual uğurla yeniləndi');
        } else {
            await api.createFAQ(data);
            showSuccess('Sual uğurla yaradıldı');
        }
        
        bootstrap.Modal.getInstance(document.getElementById('faqModal')).hide();
        await loadFAQs();
    } catch (error) {
        showError('Saxlamaq mümkün olmadı: ' + error.message);
    }
}

async function editFAQ(id) {
    try {
        const faq = await api.getFAQ(id);
        openFAQModal(id);
        setTimeout(() => {
            document.getElementById('faq-question').value = faq.question;
            document.getElementById('faq-answer').value = faq.answer;
            document.getElementById('faq-order').value = faq.order;
            document.getElementById('faq-active').checked = faq.is_active;
        }, 100);
    } catch (error) {
        showError('Sual yüklənə bilmədi: ' + error.message);
    }
}

/**
 * About Modal
 */
function openAboutModal(id = null) {
    currentEditId = id;
    const isEdit = id !== null;

    const bodyContent = `
        <form id="about-form">
            <div class="mb-3">
                <label for="about-title" class="form-label">Başlıq *</label>
                <input type="text" class="form-control" id="about-title" required>
            </div>
            <div class="mb-3">
                <label for="about-subtitle" class="form-label">Alt başlıq</label>
                <input type="text" class="form-control" id="about-subtitle">
            </div>
            <div class="mb-3">
                <label for="about-image" class="form-label">Şəkil ${isEdit ? '(cari şəkli saxlamaq üçün boş buraxın)' : ''} </label>
                <input type="file" class="form-control" id="about-image" accept="image/*">
                <img id="about-preview" src="" style="display:none; max-width:100%; margin-top:10px; border-radius:4px;">
            </div>
            <div class="mb-3">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="about-active" checked>
                    <label class="form-check-label" for="about-active">Aktiv</label>
                </div>
            </div>
        </form>
    `;

    const footerContent = `
        <button type="button" class="btn btn-primary" onclick="saveAbout()">
            <i class="fas fa-save"></i> ${isEdit ? 'Yenilə' : 'Yarat'}
        </button>
    `;

    const modal = createModal('aboutModal', isEdit ? 'Haqqında Məzmununu Redaktə Et' : 'Haqqında Məzmunu Əlavə Et', bodyContent, footerContent);
    
    document.getElementById('about-image').addEventListener('change', function(e) {
        showImagePreview(e.target, 'about-preview');
    });

    modal.show();
}

async function saveAbout() {
    const form = document.getElementById('about-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const formData = new FormData();
    formData.append('title', document.getElementById('about-title').value);
    formData.append('subtitle', document.getElementById('about-subtitle').value);
    formData.append('is_active', document.getElementById('about-active').checked);

    const imageInput = document.getElementById('about-image');
    if (imageInput.files[0]) {
        formData.append('image', imageInput.files[0]);
    }

    try {
        if (currentEditId) {
            if (imageInput.files[0]) {
                await api.updateAboutContentImage(currentEditId, formData);
            }
            const updateData = {
                title: formData.get('title'),
                subtitle: formData.get('subtitle'),
                is_active: formData.get('is_active') === 'true'
            };
            await api.updateAboutContent(currentEditId, updateData);
            showSuccess('Haqqında məzmunu uğurla yeniləndi');
        } else {
            await api.createAboutContent(formData);
            showSuccess('Haqqında məzmunu uğurla yaradıldı');
        }
        
        bootstrap.Modal.getInstance(document.getElementById('aboutModal')).hide();
        await loadAboutContent();
    } catch (error) {
        showError('Saxlamaq mümkün olmadı: ' + error.message);
    }
}

async function editAboutContent(id) {
    try {
        const about = await api.getAboutContentById(id);
        openAboutModal(id);
        setTimeout(() => {
            document.getElementById('about-title').value = about.title;
            document.getElementById('about-subtitle').value = about.subtitle || '';
            document.getElementById('about-active').checked = about.is_active;
            
            if (about.image_path) {
                const imageUrl = about.image_path.startsWith('http') 
                    ? about.image_path 
                    : `http://localhost:8000/uploads/${about.image_path}`;
                document.getElementById('about-preview').src = imageUrl;
                document.getElementById('about-preview').style.display = 'block';
            }
        }, 100);
    } catch (error) {
        showError('Haqqında məzmunu yüklənə bilmədi: ' + error.message);
    }
}

/**
 * Contact Info Modal
 */
function openContactInfoModal(id = null) {
    currentEditId = id;
    const isEdit = id !== null;

    const bodyContent = `
        <form id="contact-info-form">
            <div class="mb-3">
                <label for="contact-info-type" class="form-label">Növ *</label>
                <select class="form-control" id="contact-info-type" required>
                    <option value="phone">Telefon</option>
                    <option value="email">E-poçt</option>
                    <option value="address">Ünvan</option>
                    <option value="hours">İş saatları</option>
                    <option value="whatsapp">WhatsApp</option>
                </select>
            </div>
            <div class="mb-3">
                <label for="contact-info-label" class="form-label">Etiket *</label>
                <input type="text" class="form-control" id="contact-info-label" required>
            </div>
            <div class="mb-3">
                <label for="contact-info-value" class="form-label">Dəyər *</label>
                <input type="text" class="form-control" id="contact-info-value" required>
            </div>
            <div class="mb-3">
                <label for="contact-info-icon" class="form-label">İkon (məsələn, flaticon-call)</label>
                <input type="text" class="form-control" id="contact-info-icon">
            </div>
            <div class="mb-3">
                <label for="contact-info-order" class="form-label">Sıra</label>
                <input type="number" class="form-control" id="contact-info-order" value="0">
            </div>
            <div class="mb-3">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="contact-info-active" checked>
                    <label class="form-check-label" for="contact-info-active">Aktiv</label>
                </div>
            </div>
        </form>
    `;

    const footerContent = `
        <button type="button" class="btn btn-primary" onclick="saveContactInfo()">
            <i class="fas fa-save"></i> ${isEdit ? 'Yenilə' : 'Yarat'}
        </button>
    `;

    const modal = createModal('contactInfoModal', isEdit ? 'Əlaqə Məlumatını Redaktə Et' : 'Əlaqə Məlumatı Əlavə Et', bodyContent, footerContent);
    modal.show();
}

async function saveContactInfo() {
    const form = document.getElementById('contact-info-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const data = {
        type: document.getElementById('contact-info-type').value,
        label: document.getElementById('contact-info-label').value,
        value: document.getElementById('contact-info-value').value,
        icon: document.getElementById('contact-info-icon').value,
        order: parseInt(document.getElementById('contact-info-order').value),
        is_active: document.getElementById('contact-info-active').checked
    };

    try {
        if (currentEditId) {
            await api.updateContactInfo(currentEditId, data);
            showSuccess('Əlaqə məlumatı uğurla yeniləndi');
        } else {
            await api.createContactInfo(data);
            showSuccess('Əlaqə məlumatı uğurla yaradıldı');
        }
        
        bootstrap.Modal.getInstance(document.getElementById('contactInfoModal')).hide();
        await loadContactInfo();
    } catch (error) {
        showError('Saxlamaq mümkün olmadı: ' + error.message);
    }
}

async function editContactInfo(id) {
    try {
        const info = await api.getContactInfoById(id);
        openContactInfoModal(id);
        setTimeout(() => {
            document.getElementById('contact-info-type').value = info.type;
            document.getElementById('contact-info-label').value = info.label;
            document.getElementById('contact-info-value').value = info.value;
            document.getElementById('contact-info-icon').value = info.icon || '';
            document.getElementById('contact-info-order').value = info.order;
            document.getElementById('contact-info-active').checked = info.is_active;
        }, 100);
    } catch (error) {
        showError('Əlaqə məlumatı yüklənə bilmədi: ' + error.message);
    }
}

/**
 * Statistic Modal
 */
function openStatisticModal(id = null) {
    currentEditId = id;
    const isEdit = id !== null;

    const bodyContent = `
        <form id="statistic-form">
            <div class="mb-3">
                <label for="statistic-label" class="form-label">Etiket *</label>
                <input type="text" class="form-control" id="statistic-label" required>
            </div>
            <div class="mb-3">
                <label for="statistic-value" class="form-label">Dəyər *</label>
                <input type="number" class="form-control" id="statistic-value" required>
            </div>
            <div class="mb-3">
                <label for="statistic-icon" class="form-label">İkon (məsələn, flaticon-worker)</label>
                <input type="text" class="form-control" id="statistic-icon">
            </div>
            <div class="mb-3">
                <label for="statistic-order" class="form-label">Sıra</label>
                <input type="number" class="form-control" id="statistic-order" value="0">
            </div>
            <div class="mb-3">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="statistic-active" checked>
                    <label class="form-check-label" for="statistic-active">Aktiv</label>
                </div>
            </div>
        </form>
    `;

    const footerContent = `
        <button type="button" class="btn btn-primary" onclick="saveStatistic()">
            <i class="fas fa-save"></i> ${isEdit ? 'Yenilə' : 'Yarat'}
        </button>
    `;

    const modal = createModal('statisticModal', isEdit ? 'Statistikani Redaktə Et' : 'Statistika Əlavə Et', bodyContent, footerContent);
    modal.show();
}

async function saveStatistic() {
    const form = document.getElementById('statistic-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const data = {
        label: document.getElementById('statistic-label').value,
        value: parseInt(document.getElementById('statistic-value').value),
        icon: document.getElementById('statistic-icon').value,
        order: parseInt(document.getElementById('statistic-order').value),
        is_active: document.getElementById('statistic-active').checked
    };

    try {
        if (currentEditId) {
            await api.updateStatistic(currentEditId, data);
            showSuccess('Statistika uğurla yeniləndi');
        } else {
            await api.createStatistic(data);
            showSuccess('Statistika uğurla yaradıldı');
        }
        
        bootstrap.Modal.getInstance(document.getElementById('statisticModal')).hide();
        await loadStatistics();
    } catch (error) {
        showError('Saxlamaq mümkün olmadı: ' + error.message);
    }
}

async function editStatistic(id) {
    try {
        const stat = await api.getStatistic(id);
        openStatisticModal(id);
        setTimeout(() => {
            document.getElementById('statistic-label').value = stat.label;
            document.getElementById('statistic-value').value = stat.value;
            document.getElementById('statistic-icon').value = stat.icon || '';
            document.getElementById('statistic-order').value = stat.order;
            document.getElementById('statistic-active').checked = stat.is_active;
        }, 100);
    } catch (error) {
        showError('Statistika yüklənə bilmədi: ' + error.message);
    }
}

/**
 * Partner Modal
 */
function openPartnerModal(id = null) {
    currentEditId = id;
    const isEdit = id !== null;

    const bodyContent = `
        <form id="partner-form">
            <div class="mb-3">
                <label for="partner-name" class="form-label">Ad *</label>
                <input type="text" class="form-control" id="partner-name" required>
            </div>
            <div class="mb-3">
                <label for="partner-image" class="form-label">Şəkil ${isEdit ? '(cari şəkli saxlamaq üçün boş buraxın)' : '*'} </label>
                <input type="file" class="form-control" id="partner-image" accept="image/*" ${isEdit ? '' : 'required'}>
                <img id="partner-preview" src="" style="display:none; max-width:100%; margin-top:10px; border-radius:4px;">
            </div>
            <div class="mb-3">
                <label for="partner-website" class="form-label">Vebsayt URL</label>
                <input type="url" class="form-control" id="partner-website">
            </div>
            <div class="mb-3">
                <label for="partner-order" class="form-label">Sıra</label>
                <input type="number" class="form-control" id="partner-order" value="0">
            </div>
            <div class="mb-3">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="partner-active" checked>
                    <label class="form-check-label" for="partner-active">Aktiv</label>
                </div>
            </div>
        </form>
    `;

    const footerContent = `
        <button type="button" class="btn btn-primary" onclick="savePartner()">
            <i class="fas fa-save"></i> ${isEdit ? 'Yenilə' : 'Yarat'}
        </button>
    `;

    const modal = createModal('partnerModal', isEdit ? 'Tərəfdaşı Redaktə Et' : 'Tərəfdaş Əlavə Et', bodyContent, footerContent);
    
    document.getElementById('partner-image').addEventListener('change', function(e) {
        showImagePreview(e.target, 'partner-preview');
    });

    modal.show();
}

async function savePartner() {
    const form = document.getElementById('partner-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const formData = new FormData();
    formData.append('name', document.getElementById('partner-name').value);
    formData.append('website_url', document.getElementById('partner-website').value);
    formData.append('order', document.getElementById('partner-order').value);
    formData.append('is_active', document.getElementById('partner-active').checked);

    const imageInput = document.getElementById('partner-image');
    if (imageInput.files[0]) {
        formData.append('image', imageInput.files[0]);
    }

    try {
        if (currentEditId) {
            if (imageInput.files[0]) {
                await api.updatePartnerImage(currentEditId, formData);
            }
            const updateData = {
                name: formData.get('name'),
                website_url: formData.get('website_url'),
                order: parseInt(formData.get('order')),
                is_active: formData.get('is_active') === 'true'
            };
            await api.updatePartner(currentEditId, updateData);
            showSuccess('Tərəfdaş uğurla yeniləndi');
        } else {
            await api.createPartner(formData);
            showSuccess('Tərəfdaş uğurla yaradıldı');
        }
        
        bootstrap.Modal.getInstance(document.getElementById('partnerModal')).hide();
        await loadPartners();
    } catch (error) {
        showError('Saxlamaq mümkün olmadı: ' + error.message);
    }
}

async function editPartner(id) {
    try {
        const partner = await api.getPartner(id);
        openPartnerModal(id);
        setTimeout(() => {
            document.getElementById('partner-name').value = partner.name;
            document.getElementById('partner-website').value = partner.website_url || '';
            document.getElementById('partner-order').value = partner.order;
            document.getElementById('partner-active').checked = partner.is_active;
            
            if (partner.image_path) {
                const imageUrl = partner.image_path.startsWith('http') 
                    ? partner.image_path 
                    : `http://localhost:8000/uploads/${partner.image_path}`;
                document.getElementById('partner-preview').src = imageUrl;
                document.getElementById('partner-preview').style.display = 'block';
            }
        }, 100);
    } catch (error) {
        showError('Tərəfdaş yüklənə bilmədi: ' + error.message);
    }
}

/**
 * License Modal
 */
function openLicenseModal(id = null) {
    currentEditId = id;
    const isEdit = id !== null;

    const bodyContent = `
        <form id="license-form">
            <div class="mb-3">
                <label for="license-title" class="form-label">Başlıq *</label>
                <input type="text" class="form-control" id="license-title" required>
            </div>
            <div class="mb-3">
                <label for="license-image" class="form-label">Şəkil ${isEdit ? '(cari şəkli saxlamaq üçün boş buraxın)' : '*'} </label>
                <input type="file" class="form-control" id="license-image" accept="image/*" ${isEdit ? '' : 'required'}>
                <img id="license-preview" src="" style="display:none; max-width:100%; margin-top:10px; border-radius:4px;">
            </div>
            <div class="mb-3">
                <label for="license-order" class="form-label">Sıra</label>
                <input type="number" class="form-control" id="license-order" value="0">
            </div>
            <div class="mb-3">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="license-active" checked>
                    <label class="form-check-label" for="license-active">Aktiv</label>
                </div>
            </div>
        </form>
    `;

    const footerContent = `
        <button type="button" class="btn btn-primary" onclick="saveLicense()">
            <i class="fas fa-save"></i> ${isEdit ? 'Yenilə' : 'Yarat'}
        </button>
    `;

    const modal = createModal('licenseModal', isEdit ? 'Lisenziyanı Redaktə Et' : 'Lisenziya Əlavə Et', bodyContent, footerContent);
    
    document.getElementById('license-image').addEventListener('change', function(e) {
        showImagePreview(e.target, 'license-preview');
    });

    modal.show();
}

async function saveLicense() {
    const form = document.getElementById('license-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const formData = new FormData();
    formData.append('title', document.getElementById('license-title').value);
    formData.append('order', document.getElementById('license-order').value);
    formData.append('is_active', document.getElementById('license-active').checked);

    const imageInput = document.getElementById('license-image');
    if (imageInput.files[0]) {
        formData.append('image', imageInput.files[0]);
    }

    try {
        if (currentEditId) {
            if (imageInput.files[0]) {
                await api.updateLicenseImage(currentEditId, formData);
            }
            const updateData = {
                title: formData.get('title'),
                order: parseInt(formData.get('order')),
                is_active: formData.get('is_active') === 'true'
            };
            await api.updateLicense(currentEditId, updateData);
            showSuccess('Lisenziya uğurla yeniləndi');
        } else {
            await api.createLicense(formData);
            showSuccess('Lisenziya uğurla yaradıldı');
        }
        
        bootstrap.Modal.getInstance(document.getElementById('licenseModal')).hide();
        await loadLicenses();
    } catch (error) {
        showError('Saxlamaq mümkün olmadı: ' + error.message);
    }
}

async function editLicense(id) {
    try {
        const license = await api.getLicense(id);
        openLicenseModal(id);
        setTimeout(() => {
            document.getElementById('license-title').value = license.title;
            document.getElementById('license-order').value = license.order;
            document.getElementById('license-active').checked = license.is_active;
            
            if (license.image_path) {
                const imageUrl = license.image_path.startsWith('http') 
                    ? license.image_path 
                    : `http://localhost:8000/uploads/${license.image_path}`;
                document.getElementById('license-preview').src = imageUrl;
                document.getElementById('license-preview').style.display = 'block';
            }
        }, 100);
    } catch (error) {
        showError('Lisenziya yüklənə bilmədi: ' + error.message);
    }
}

