import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';

const API_KEY = '38236174-4d8ed5bf6b97529f1e348bf6d';
const BASE_URL = 'https://pixabay.com/api/';

const formEl = document.querySelector('#search-form');
const inputEl = document.querySelector('#search-form input');
const galleryItemsEl = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

let nameImages = '';
let currentPage = 1;
let totalPage = 0;
let perPage = 0;

formEl.addEventListener('submit', onSubmit);
loadMoreBtn.addEventListener('click', onClickLoadMoreBtn);

const galleryLightBox = new SimpleLightbox('.gallery a');

function createMarkup(arr) {
    return arr
      .map(
        ({
          webformatURL,
          largeImageURL,
          tags,
          likes,
          views,
          comments,
          downloads,
        }) =>
          `<div class="photo-card">
              
              <div class="thumb-img">
                  <a class="gallery-link" href=${largeImageURL}>
                      <img class="gallery-image" src=${webformatURL} alt="${tags}" loading="lazy"/>
                  </a>
              </div>
              
              <div class="info">
                  <p class="info-item">
                  <b>Likes</b>${likes}
                  </p>
                  <p class="info-item">
                  <b>Views</b>${views}
                  </p>
                  <p class="info-item">
                  <b>Comments</b>${comments}
                  </p>
                  <p class="info-item">
                  <b>Downloads</b>${downloads}
                  </p>
              </div>
          </div>`
      )
      .join('');
  };

async function onSubmit(e) {
  e.preventDefault();
  const {
    elements: { searchQuery },
  } = e.currentTarget;

  nameImages = searchQuery.value.trim();
  currentPage = 1;
  loadMoreBtn.hidden = true;

  if (nameImages === '') {
    e.currentTarget.reset();
    return;
  }

  try {
    const dataGallery = await getImages();
    galleryItemsEl.innerHTML = createMarkup(dataGallery.data.hits);
    galleryLightBox.refresh();

    if (dataGallery.data.hits.length) {
      Notify.success(`Hooray! We found ${dataGallery.data.totalHits} images.`);
    } else {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      galleryItemsEl.innerHTML = '';
      loadMoreBtn.hidden = true;
    }

    totalPage =
      Math.ceil(dataGallery.data.totalHits / dataGallery.data.hits.length) ||
      'No more pages!';
    perPage = dataGallery.data.hits.length;

    if (totalPage > currentPage) {
      loadMoreBtn.hidden = false;
    }
  } catch (error) {
    console.error(error);
    galleryItemsEl.innerHTML = '';
    loadMoreBtn.hidden = true;
    currentPage = 1;
  }
};

inputEl.addEventListener('input', event => {
  if (event.currentTarget.value === '') {
    galleryItemsEl.innerHTML = '';
    loadMoreBtn.hidden = true;
    currentPage = 1;
  }
});

async function onClickLoadMoreBtn() {
  currentPage += 1;
  if (currentPage === totalPage) {
    loadMoreBtn.hidden = true;

    Notify.failure(
        "We're sorry, but you've reached the end of search results."
    );
  }
  try {
    const dataGalleryPagination = await getImages();
    galleryItemsEl.insertAdjacentHTML(
      'beforeend',
      createMarkup(dataGalleryPagination.data.hits)
    );
    galleryLightBox.refresh();
    perPage = dataGalleryPagination.data.hits.length;

  } catch (error) {
    console.error(error);
    galleryItemsEl.innerHTML = '';
    loadMoreBtn.hidden = true;
    currentPage = 1;
  }
};

async function getImages() {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        key: API_KEY,
        q: nameImages,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: 40,
        page: currentPage,
      },
    });

    return response;
  } catch (error) {
    console.error(error);
  }
};