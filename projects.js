// ========================================
// DYNAMIC PORTFOLIO PROJECTS
// MULTIPLE PHOTO GALLERY
// ========================================

async function loadProjects() {

  const container = document.getElementById("projectsGrid");

  if (!container) return;

  container.innerHTML = `
    <p class="mono">LOADING PROJECTS...</p>
  `;

  try {

    const { data, error } = await db
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {

      container.innerHTML = `
        <p class="mono">NO PROJECTS AVAILABLE YET.</p>
      `;

      return;
    }


    const safe = value => String(value || "")
      .replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[char]);


    container.innerHTML = data.map((project, index) => {

      const features = Array.isArray(project.features)
        ? project.features
        : String(project.features || "")
            .split(",")
            .filter(Boolean);

      const technologies = Array.isArray(project.technologies)
        ? project.technologies
        : String(project.technologies || "")
            .split(",")
            .filter(Boolean);


      // Multiple images with old image_url support.

      let images = Array.isArray(project.images)
        ? project.images
        : [];

      if (images.length === 0 && project.image_url) {

        images = [{
          url: project.image_url
        }];

      }

      images = images.filter(image => image && image.url);


      // Gallery HTML.

      const gallery = images.length > 0

        ? `

          <div class="project-gallery" data-gallery="${index}">

            <div class="gallery-image-wrap">

              <img
                class="project-image gallery-main-image"
                src="${safe(images[0].url)}"
                alt="${safe(project.title)}"
                loading="lazy"
              >

              ${
                images.length > 1
                  ? `
                    <button
                      type="button"
                      class="gallery-arrow gallery-prev"
                      aria-label="Previous photo"
                    >‹</button>

                    <button
                      type="button"
                      class="gallery-arrow gallery-next"
                      aria-label="Next photo"
                    >›</button>
                  `
                  : ""
              }

              ${
                images.length > 1
                  ? `
                    <span class="gallery-counter">
                      1 / ${images.length}
                    </span>
                  `
                  : ""
              }

            </div>

            ${
              images.length > 1
                ? `
                  <div class="gallery-dots">

                    ${images.map((image, i) => `
                      <button
                        type="button"
                        class="gallery-dot ${i === 0 ? "active" : ""}"
                        data-index="${i}"
                        aria-label="Show photo ${i + 1}"
                      ></button>
                    `).join("")}

                  </div>
                `
                : ""
            }

          </div>

        `

        : "";


      const github = project.github_url

        ? `
          <a
            href="${safe(project.github_url)}"
            target="_blank"
            rel="noopener noreferrer"
          >GITHUB ↗</a>
        `

        : "";


      const live = project.live_url

        ? `
          <a
            href="${safe(project.live_url)}"
            target="_blank"
            rel="noopener noreferrer"
          >LIVE DEMO ↗</a>
        `

        : "";


      return `

        <article class="proj reveal">

          <div class="num">
            ${String(index + 1).padStart(2, "0")}
          </div>

          <div class="body">

            ${gallery}

            <h3>${safe(project.title)}</h3>

            <p class="lead">
              ${safe(project.description)}
            </p>

            <ul>

              ${features.map(feature => `
                <li>${safe(feature)}</li>
              `).join("")}

            </ul>

            <div class="chips">

              ${technologies.map(tech => `
                <span>${safe(tech)}</span>
              `).join("")}

            </div>

            <div class="links2">
              ${github}
              ${live}
            </div>

          </div>

        </article>

      `;

    }).join("");


    // ========================================
    // GALLERY CONTROLS
    // ========================================

    data.forEach((project, index) => {

      let images = Array.isArray(project.images)
        ? project.images
        : [];

      if (images.length === 0 && project.image_url) {
        images = [{ url: project.image_url }];
      }

      images = images.filter(image => image && image.url);

      if (images.length <= 1) return;

      const gallery = container.querySelector(
        `[data-gallery="${index}"]`
      );

      if (!gallery) return;

      const mainImage = gallery.querySelector(".gallery-main-image");
      const counter = gallery.querySelector(".gallery-counter");

      const dots = gallery.querySelectorAll(".gallery-dot");

      let currentIndex = 0;


      function showImage(nextIndex) {

        currentIndex =
          (nextIndex + images.length) % images.length;

        mainImage.src = images[currentIndex].url;

        mainImage.alt =
          `${project.title} photo ${currentIndex + 1}`;

        counter.textContent =
          `${currentIndex + 1} / ${images.length}`;

        dots.forEach((dot, i) => {

          dot.classList.toggle(
            "active",
            i === currentIndex
          );

        });

      }


      gallery.querySelector(".gallery-prev")
        .addEventListener("click", () => {

          showImage(currentIndex - 1);

        });


      gallery.querySelector(".gallery-next")
        .addEventListener("click", () => {

          showImage(currentIndex + 1);

        });


      dots.forEach(dot => {

        dot.addEventListener("click", () => {

          showImage(Number(dot.dataset.index));

        });

      });

    });


    if (typeof initReveal === "function") {
      initReveal();
    }

  } catch (error) {

    console.error("Project loading error:", error);

    container.innerHTML = `
      <p class="mono">
        UNABLE TO LOAD PROJECTS. PLEASE TRY AGAIN.
      </p>
    `;

  }

}


document.addEventListener("DOMContentLoaded", loadProjects);