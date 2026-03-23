document.addEventListener('DOMContentLoaded', () => {
    
    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links li a');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close mobile menu when link is clicked
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    // Reveal on Scroll (Intersection Observer)
    const revealElements = document.querySelectorAll('.reveal');

    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // Form Submission Handling (with Formspree)
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.innerText;
            
            // Loading state
            btn.innerText = 'Sending...';
            btn.style.opacity = '0.7';

            const formData = new FormData(contactForm);

            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    btn.innerText = 'Message Sent';
                    btn.style.background = '#4CAF50';
                    btn.style.color = 'white';
                    btn.style.borderColor = '#4CAF50';
                    btn.style.opacity = '1';
                    contactForm.reset();
                } else {
                    const data = await response.json();
                    if (Object.hasOwn(data, 'errors')) {
                        btn.innerText = data.errors.map(error => error.message).join(", ");
                    } else {
                        btn.innerText = 'Oops! There was a problem.';
                    }
                    btn.style.background = '#f44336';
                    btn.style.borderColor = '#f44336';
                    btn.style.color = 'white';
                    btn.style.opacity = '1';
                }
            } catch (error) {
                btn.innerText = 'Oops! There was a problem.';
                btn.style.background = '#f44336';
                btn.style.borderColor = '#f44336';
                btn.style.color = 'white';
                btn.style.opacity = '1';
            }
            
            // Reset button after 4 seconds
            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.background = 'var(--accent)';
                btn.style.color = 'var(--bg-color)';
                btn.style.borderColor = 'none';
            }, 4000);
        });
    }

    // --- Dynamic Projects Rendering ---
    
    // Render Featured Projects (Home Page)
    const featuredProjectsGrid = document.getElementById('featured-projects-grid');
    if (featuredProjectsGrid && typeof aibelProjects !== 'undefined') {
        const featured = aibelProjects.slice(0, 2);
        featured.forEach((project, index) => {
            const delay = index + 1;
            const card = document.createElement('div');
            card.className = `project-card reveal fade-up delay-${delay}`;
            card.innerHTML = `
                <div class="project-img-wrapper">
                    <img src="${project.images[0]}" alt="${project.title}">
                    <div class="project-overlay">
                        <a href="projects.html" class="view-btn">View Details</a>
                    </div>
                </div>
                <div class="project-info">
                    <h3>${project.title}</h3>
                    <span>${project.category} / ${project.year}</span>
                </div>
            `;
            featuredProjectsGrid.appendChild(card);
        });
    }

    // --- Local Storage Project Merging ---
    const localProjects = JSON.parse(localStorage.getItem('customAibelProjects')) || [];
    const hiddenProjects = JSON.parse(localStorage.getItem('customHiddenAibelProjects')) || [];
    
    // Helper to merge local projects over hardcoded ones
    function getMergedProjects(hardcodedList, isUpcomingTarget) {
        let merged = typeof hardcodedList !== 'undefined' ? [...hardcodedList] : [];
        const targetedLocal = localProjects.filter(p => p.isUpcoming === isUpcomingTarget);
        
        targetedLocal.forEach(lp => {
            const existingIndex = merged.findIndex(p => p.id === lp.id);
            if (existingIndex !== -1) {
                merged[existingIndex] = lp; // Overwrite hardcoded with local edit
            } else {
                merged.push(lp); // Append new local project
            }
        });

        // Filter out any deleted projects
        return merged.filter(p => !hiddenProjects.includes(p.id));
    }

    const finalCompletedProjects = getMergedProjects(typeof aibelProjects !== 'undefined' ? aibelProjects : [], false);
    const finalUpcomingProjects = getMergedProjects(typeof aibelUpcomingProjects !== 'undefined' ? aibelUpcomingProjects : [], true);

    // --- Render Helper ---
    function renderProjectsToContainer(projectsArray, containerId, isUpcoming) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = ''; // Clear container

        projectsArray.forEach((project, index) => {
            const block = document.createElement('div');
            block.className = `reveal fade-up active`; // force active for dynamic
            block.style.marginBottom = '6rem';
            
            let imagesHtml = '';
            if (project.images && project.images.length > 0) {
                project.images.forEach(img => {
                    imagesHtml += `<div class="gallery-item" onclick="if(typeof openLightbox === 'function') openLightbox('${img}')"><img src="${img}" alt="${project.title}" style="width:100%; height:100%; object-fit:cover; aspect-ratio:1; cursor:pointer;"></div>`;
                });
            }

            block.innerHTML = `
                <div class="project-head" style="margin-bottom: 2rem; position: relative;">
                    <button onclick="openAdminModal('${project.id}')" class="btn-outline" style="position: absolute; right: 0; top: 0; padding: 0.5rem 1rem; font-size: 0.7rem; border-color: var(--accent); color: var(--accent);">Edit Project</button>
                    <h2 style="font-size: 2.5rem; color: var(--accent); margin-bottom: 0.5rem; padding-right: 6rem;">${project.title}</h2>
                    <span style="display:block; color: var(--text-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom: 1rem;">${project.category} / ${project.year}</span>
                    <p style="max-width: 800px; font-size: 1.1rem; color: var(--text-main); margin-bottom: 2rem;">${project.description}</p>
                </div>
                <div class="gallery-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
                    ${imagesHtml}
                </div>
            `;
            container.appendChild(block);
        });
    }

    renderProjectsToContainer(finalCompletedProjects, 'full-projects-container', false);
    renderProjectsToContainer(finalUpcomingProjects, 'upcoming-projects-container', true);

    // Interactive Parallax effect on hero background
    const heroBg = document.querySelector('.hero-bg');
    if (heroBg) {
        window.addEventListener('scroll', () => {
            const scrollValue = window.scrollY;
            if (scrollValue < window.innerHeight) {
                heroBg.style.transform = `scale(1.05) translateY(${scrollValue * 0.4}px)`;
            }
        });
    }
});

// --- Project Modal Functions ---
window.openProjectModal = function(projectId, isUpcoming = false) {
    let project;
    if (isUpcoming && typeof aibelUpcomingProjects !== 'undefined') {
        project = aibelUpcomingProjects.find(p => p.id === projectId);
    } else if (typeof aibelProjects !== 'undefined') {
        project = aibelProjects.find(p => p.id === projectId);
    }
    
    if (!project) return;

    document.getElementById('modalTitle').innerText = project.title;
    document.getElementById('modalCategory').innerText = project.category;
    document.getElementById('modalYear').innerText = project.year;
    document.getElementById('modalDescription').innerText = project.description;

    const modalGallery = document.getElementById('modalGallery');
    if (modalGallery) {
        modalGallery.innerHTML = ''; // Clear previous images
        project.images.forEach(imgSrc => {
            const img = document.createElement('img');
            img.src = imgSrc;
            img.alt = project.title;
            modalGallery.appendChild(img);
        });
    }

    const modal = document.getElementById('projectModal');
    if (modal) modal.classList.add('active');
};

window.closeProjectModal = function() {
    const modal = document.getElementById('projectModal');
    if (modal) modal.classList.remove('active');
};

// Close modal when clicking outside content
document.addEventListener('DOMContentLoaded', () => {
    const projectModal = document.getElementById('projectModal');
    if (projectModal) {
        projectModal.addEventListener('click', function (e) {
            if (e.target === this) closeProjectModal();
        });
    }
});

// --- Admin CMS Functions ---
window.openAdminModal = function(projectId = null) {
    const modal = document.getElementById('adminModal');
    const form = document.getElementById('adminForm');
    form.reset();
    
    document.getElementById('adminDeleteBtn').style.display = 'none';

    if (projectId) {
        document.getElementById('adminModalTitle').innerText = "Edit Project";
        document.getElementById('adminProjectId').value = projectId;
        
        let localProjects = JSON.parse(localStorage.getItem('customAibelProjects')) || [];
        let project = localProjects.find(p => p.id === projectId);
        
        if (!project) {
            project = (typeof aibelProjects !== 'undefined' ? aibelProjects : []).find(p => p.id === projectId);
            if (project) {
                document.getElementById('adminProjectType').value = 'completed';
            } else {
                project = (typeof aibelUpcomingProjects !== 'undefined' ? aibelUpcomingProjects : []).find(p => p.id === projectId);
                if (project) document.getElementById('adminProjectType').value = 'upcoming';
            }
        } else {
            document.getElementById('adminProjectType').value = project.isUpcoming ? 'upcoming' : 'completed';
        }

        if (project) {
            document.getElementById('adminProjectTitle').value = project.title || '';
            document.getElementById('adminProjectCategory').value = project.category || '';
            document.getElementById('adminProjectYear').value = project.year || '';
            document.getElementById('adminProjectDesc').value = project.description || '';
            document.getElementById('adminOriginalIsUpcoming').value = project.isUpcoming ? "true" : "false";
            document.getElementById('adminDeleteBtn').style.display = 'block';
        }
    } else {
        document.getElementById('adminModalTitle').innerText = "Add New Project";
        document.getElementById('adminProjectId').value = 'proj-' + Date.now();
        document.getElementById('adminProjectType').value = 'completed';
        document.getElementById('adminOriginalIsUpcoming').value = "false";
    }

    if (modal) modal.classList.add('active');
};

window.closeAdminModal = function() {
    const modal = document.getElementById('adminModal');
    if (modal) modal.classList.remove('active');
};

function readImagesAsBase64(files) {
    return Promise.all(Array.from(files).map(file => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }));
}

window.saveAdminProject = async function() {
    const title = document.getElementById('adminProjectTitle').value;
    const category = document.getElementById('adminProjectCategory').value;
    const year = document.getElementById('adminProjectYear').value;
    const desc = document.getElementById('adminProjectDesc').value;
    const type = document.getElementById('adminProjectType').value;
    const isUpcoming = (type === 'upcoming');
    const id = document.getElementById('adminProjectId').value;
    const imageFiles = document.getElementById('adminProjectImages').files;

    if (!title || !category || !year || !desc) {
        alert("Please fill out all text fields.");
        return;
    }

    if (!id.startsWith('proj-') && imageFiles.length === 0) {
        // Handled
    } else if (imageFiles.length === 0 && id.startsWith('proj-')) {
        alert("Please upload at least one image for a new project.");
        return;
    }

    let newImages = [];
    if (imageFiles.length > 0) {
        newImages = await readImagesAsBase64(imageFiles);
    }

    let localProjects = JSON.parse(localStorage.getItem('customAibelProjects')) || [];
    let existingIndex = localProjects.findIndex(p => p.id === id);

    let projectObj = {
        id: id,
        title: title,
        category: category,
        year: year,
        description: desc,
        isUpcoming: isUpcoming,
        images: newImages
    };

    if (existingIndex !== -1) {
        if (imageFiles.length === 0) projectObj.images = localProjects[existingIndex].images;
        localProjects[existingIndex] = projectObj;
    } else {
        if (imageFiles.length === 0) {
           let oldProject = (typeof aibelProjects !== 'undefined' ? aibelProjects : []).find(p => p.id === id);
           if (!oldProject) oldProject = (typeof aibelUpcomingProjects !== 'undefined' ? aibelUpcomingProjects : []).find(p => p.id === id);
           if (oldProject) projectObj.images = oldProject.images;
        }
        localProjects.push(projectObj);
    }

    localStorage.setItem('customAibelProjects', JSON.stringify(localProjects));
    closeAdminModal();
    window.location.reload();
};

window.deleteAdminProject = function() {
    const id = document.getElementById('adminProjectId').value;
    if (confirm("Are you sure you want to delete this project?")) {
        let localProjects = JSON.parse(localStorage.getItem('customAibelProjects')) || [];
        localProjects = localProjects.filter(p => p.id !== id);
        
        let hiddenProjects = JSON.parse(localStorage.getItem('customHiddenAibelProjects')) || [];
        hiddenProjects.push(id);
        localStorage.setItem('customHiddenAibelProjects', JSON.stringify(hiddenProjects));
        
        localStorage.setItem('customAibelProjects', JSON.stringify(localProjects));
        closeAdminModal();
        window.location.reload();
    }
};
