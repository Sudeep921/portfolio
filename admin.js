
// ========================================
// PORTFOLIO ADMIN DASHBOARD
// MULTIPLE PHOTO ADD / EDIT / DELETE SYSTEM
// SUPABASE
// ========================================

const loginSection = document.getElementById("loginSection");
const dashboardSection = document.getElementById("dashboardSection");

const loginForm = document.getElementById("loginForm");
const projectForm = document.getElementById("projectForm");

const loginMessage = document.getElementById("loginMessage");
const formMessage = document.getElementById("formMessage");

const adminProjects = document.getElementById("adminProjects");

const photoInput = document.getElementById("projectImage");
const photoPreview = document.getElementById("photoPreview");
const existingPhotos = document.getElementById("existingPhotos");

const BUCKET = "portfolio-projects";
const MAX_PHOTOS = 10;

// Existing photos
let currentImages = [];

// Newly selected photos
let selectedPhotos = [];

// Existing photos marked for deletion
let photosToDelete = [];


// ========================================
// HELPERS
// ========================================

function escapeHTML(value) {
  return String(value || "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}


function getProjectImages(project) {
  let images = Array.isArray(project.images)
    ? project.images
    : [];

  if (images.length === 0 && project.image_url) {
    images = [{
      url: project.image_url,
      path: project.image_path || ""
    }];
  }

  return images.filter(image => image && image.url);
}


function showMessage(message, color) {
  formMessage.textContent = message;
  formMessage.style.color = color || "";
}


// ========================================
// LOGIN CHECK
// ========================================

async function checkAdmin() {
  const { data, error } = await db.auth.getSession();

  if (error) {
    showLogin();
    return;
  }

  if (data.session) {
    showDashboard();
  } else {
    showLogin();
  }
}


function showLogin() {
  loginSection.hidden = false;
  dashboardSection.hidden = true;
}


function showDashboard() {
  loginSection.hidden = true;
  dashboardSection.hidden = false;

  loadAdminProjects();
}


// ========================================
// LOGIN
// ========================================

loginForm.addEventListener("submit", async event => {
  event.preventDefault();

  loginMessage.textContent = "Logging in...";

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await db.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    loginMessage.textContent = error.message;
    return;
  }

  loginMessage.textContent = "Login successful.";

  showDashboard();
});


// ========================================
// LOGOUT
// ========================================

document.getElementById("logoutBtn").addEventListener(
  "click",
  async () => {
    await db.auth.signOut();

    resetProjectForm();
    showLogin();
  }
);


// ========================================
// LOAD PROJECTS
// ========================================

async function loadAdminProjects() {
  adminProjects.innerHTML = "Loading projects...";

  const { data, error } = await db
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    adminProjects.textContent = error.message;
    return;
  }

  if (!data || data.length === 0) {
    adminProjects.innerHTML = "<p>No projects added yet.</p>";
    return;
  }

  adminProjects.innerHTML = data.map(project => {
    const images = getProjectImages(project);

    return `
      <div class="project-row">

        <div>
          <h3>${escapeHTML(project.title)}</h3>

          <p>${escapeHTML(project.description)}</p>

          <p>
            <strong>${images.length}</strong> Photos
          </p>

          <div class="admin-project-photos">
            ${images.map(image => `
              <img
                src="${escapeHTML(image.url)}"
                alt="Project photo"
                loading="lazy"
              >
            `).join("")}
          </div>
        </div>

        <div class="project-actions">
          <button
            type="button"
            class="edit"
            data-edit="${escapeHTML(project.id)}">
            EDIT
          </button>

          <button
            type="button"
            class="delete"
            data-delete="${escapeHTML(project.id)}">
            DELETE
          </button>
        </div>

      </div>
    `;
  }).join("");

  adminProjects.querySelectorAll("[data-edit]").forEach(button => {
    button.addEventListener("click", () => {
      editProject(button.dataset.edit);
    });
  });

  adminProjects.querySelectorAll("[data-delete]").forEach(button => {
    button.addEventListener("click", () => {
      deleteProject(button.dataset.delete);
    });
  });
}


// ========================================
// DISPLAY EXISTING PHOTOS
// ========================================

function displayExistingPhotos() {
  existingPhotos.innerHTML = "";

  currentImages.forEach((image, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "photo-preview-item";

    const img = document.createElement("img");
    img.src = image.url;
    img.alt = "Existing project photo";

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.textContent = "×";
    removeButton.className = "remove-photo";

    removeButton.addEventListener("click", () => {
      const removed = currentImages.splice(index, 1)[0];

      if (removed) {
        photosToDelete.push(removed);
      }

      displayExistingPhotos();
      updatePhotoCount();
    });

    wrapper.appendChild(img);
    wrapper.appendChild(removeButton);

    existingPhotos.appendChild(wrapper);
  });
}


// ========================================
// DISPLAY NEW PHOTO PREVIEWS
// ========================================

function displayNewPhotoPreviews() {
  photoPreview.innerHTML = "";

  selectedPhotos.forEach((file, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "photo-preview-item";

    const img = document.createElement("img");
    const imageURL = URL.createObjectURL(file);

    img.src = imageURL;
    img.alt = file.name;

    img.onload = () => URL.revokeObjectURL(imageURL);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.textContent = "×";
    removeButton.className = "remove-photo";

    removeButton.addEventListener("click", () => {
      selectedPhotos.splice(index, 1);

      displayNewPhotoPreviews();
      updatePhotoCount();
    });

    wrapper.appendChild(img);
    wrapper.appendChild(removeButton);

    photoPreview.appendChild(wrapper);
  });
}


// ========================================
// PHOTO COUNT
// ========================================

function updatePhotoCount() {
  const total = currentImages.length + selectedPhotos.length;

  const counter = document.getElementById("photoCount");

  if (counter) {
    counter.textContent = `${total}/${MAX_PHOTOS} photos`;
  }
}


// ========================================
// SELECT MULTIPLE PHOTOS
// ========================================

photoInput.addEventListener("change", () => {
  const files = Array.from(photoInput.files || []);

  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      alert(`${file.name} is not an image.`);
      continue;
    }

    const total = currentImages.length + selectedPhotos.length;

    if (total >= MAX_PHOTOS) {
      alert(`Maximum ${MAX_PHOTOS} photos allowed.`);
      break;
    }

    selectedPhotos.push(file);
  }

  photoInput.value = "";

  displayNewPhotoPreviews();
  updatePhotoCount();
});


// ========================================
// UPLOAD IMAGE
// ========================================

async function uploadImage(file) {
  const extension = file.name
    .split(".")
    .pop()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  const fileName =
    `${Date.now()}-${crypto.randomUUID()}.${extension || "jpg"}`;

  const { error } = await db.storage
    .from(BUCKET)
    .upload(fileName, file, {
      upsert: false,
      contentType: file.type
    });

  if (error) throw error;

  const { data } = db.storage
    .from(BUCKET)
    .getPublicUrl(fileName);

  return {
    path: fileName,
    url: data.publicUrl
  };
}


// ========================================
// UPLOAD MULTIPLE IMAGES
// ========================================

async function uploadMultipleImages(files) {
  const uploadedImages = [];

  for (const file of files) {
    const uploaded = await uploadImage(file);
    uploadedImages.push(uploaded);
  }

  return uploadedImages;
}


// ========================================
// SAVE / UPDATE PROJECT
// ========================================

projectForm.addEventListener("submit", async event => {
  event.preventDefault();

  const saveButton = document.getElementById("saveBtn");

  const projectId = document.getElementById("projectId").value;

  const title =
    document.getElementById("projectTitle").value.trim();

  const description =
    document.getElementById("projectDescription").value.trim();

  const features =
    document.getElementById("projectFeatures").value
      .split(",")
      .map(item => item.trim())
      .filter(Boolean);

  const technologies =
    document.getElementById("projectTechnologies").value
      .split(",")
      .map(item => item.trim())
      .filter(Boolean);

  const github_url =
    document.getElementById("githubUrl").value.trim();

  const live_url =
    document.getElementById("liveUrl").value.trim();

  if (!title) {
    showMessage("Please enter project title.", "red");
    return;
  }

  if (currentImages.length + selectedPhotos.length > MAX_PHOTOS) {
    showMessage(`Maximum ${MAX_PHOTOS} photos allowed.`, "red");
    return;
  }

  saveButton.disabled = true;
  saveButton.textContent = "SAVING...";

  showMessage("Uploading photos...");

  try {
    // Upload new photos
    const newUploadedImages = selectedPhotos.length
      ? await uploadMultipleImages(selectedPhotos)
      : [];

    // Combine old and new photos
    const allImages = [
      ...currentImages,
      ...newUploadedImages
    ];

    const firstImage = allImages[0] || null;

    const projectData = {
      title,
      description,
      features,
      technologies,
      images: allImages,

      // Backward compatibility
      image_url: firstImage?.url || "",
      image_path: firstImage?.path || "",

      github_url,
      live_url
    };

    let result;

    if (projectId) {
      result = await db
        .from("projects")
        .update(projectData)
        .eq("id", projectId);
    } else {
      result = await db
        .from("projects")
        .insert([projectData]);
    }

    if (result.error) throw result.error;

    // Delete removed images only after successful database update
    const pathsToRemove = [
      ...new Set(
        photosToDelete
          .map(image => image.path)
          .filter(Boolean)
      )
    ];

    if (pathsToRemove.length > 0) {
      const { error: storageError } = await db.storage
        .from(BUCKET)
        .remove(pathsToRemove);

      if (storageError) {
        console.error("Storage cleanup error:", storageError);
        showMessage(
          "Project saved, but some removed photos could not be deleted from storage.",
          "orange"
        );
      }
    }

    if (!formMessage.textContent.includes("could not be deleted")) {
      showMessage(
        projectId
          ? "Project updated successfully!"
          : "Project saved successfully!",
        "green"
      );
    }

    resetProjectForm();

    await loadAdminProjects();

  } catch (error) {
    console.error("Project save error:", error);

    showMessage(
      error.message || "Unable to save project.",
      "red"
    );

  } finally {
    saveButton.disabled = false;

    saveButton.textContent =
      document.getElementById("projectId").value
        ? "UPDATE PROJECT"
        : "SAVE PROJECT";
  }
});


// ========================================
// EDIT PROJECT
// ========================================

async function editProject(id) {
  const { data, error } = await db
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    alert(error.message);
    return;
  }

  resetProjectForm();

  document.getElementById("projectId").value = data.id;

  document.getElementById("projectTitle").value =
    data.title || "";

  document.getElementById("projectDescription").value =
    data.description || "";

  document.getElementById("projectFeatures").value =
    Array.isArray(data.features)
      ? data.features.join(", ")
      : data.features || "";

  document.getElementById("projectTechnologies").value =
    Array.isArray(data.technologies)
      ? data.technologies.join(", ")
      : data.technologies || "";

  document.getElementById("githubUrl").value =
    data.github_url || "";

  document.getElementById("liveUrl").value =
    data.live_url || "";

  // Load existing project photos
  currentImages = getProjectImages(data);

  selectedPhotos = [];
  photosToDelete = [];

  displayExistingPhotos();
  displayNewPhotoPreviews();
  updatePhotoCount();

  document.getElementById("formTitle").textContent =
    "Edit Project";

  document.getElementById("saveBtn").textContent =
    "UPDATE PROJECT";

  document.getElementById("cancelEditBtn").hidden = false;

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


// ========================================
// DELETE PROJECT
// ========================================

async function deleteProject(id) {
  const confirmed = confirm(
    "Are you sure you want to delete this project and all its photos?"
  );

  if (!confirmed) return;

  const { data: project, error: fetchError } = await db
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError) {
    alert(fetchError.message);
    return;
  }

  const { error } = await db
    .from("projects")
    .delete()
    .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  const images = getProjectImages(project);

  const paths = [
    ...new Set(
      images.map(image => image.path).filter(Boolean)
    )
  ];

  if (paths.length > 0) {
    const { error: storageError } = await db.storage
      .from(BUCKET)
      .remove(paths);

    if (storageError) {
      console.error("Photo cleanup error:", storageError);
      alert("Project deleted, but some photos could not be removed.");
    }
  }

  alert("Project deleted successfully.");

  await loadAdminProjects();
}


// ========================================
// RESET FORM
// ========================================

function resetProjectForm() {
  projectForm.reset();

  document.getElementById("projectId").value = "";

  currentImages = [];
  selectedPhotos = [];
  photosToDelete = [];

  photoPreview.innerHTML = "";
  existingPhotos.innerHTML = "";

  document.getElementById("formTitle").textContent =
    "Add New Project";

  document.getElementById("saveBtn").textContent =
    "SAVE PROJECT";

  document.getElementById("cancelEditBtn").hidden = true;

  formMessage.textContent = "";

  updatePhotoCount();
}


// ========================================
// CANCEL EDIT
// ========================================

document.getElementById("cancelEditBtn").addEventListener(
  "click",
  resetProjectForm
);


// ========================================
// INITIALIZE
// ========================================

checkAdmin();
