const rootElement = document.getElementById("root");
const menuContatiner = document.createElement("aside");
const pageElement = document.createElement("main");
rootElement.appendChild(menuContatiner);
rootElement.appendChild(pageElement);

function createInput(type, text, name) {
  const input = document.createElement("input");
  input.type = type;
  input.name = name;
  input.placeholder = text;

  return input;
}

function ajax(method, url, body = null, callback) {
  const xhr = new XMLHttpRequest();
  xhr.open(method, url, true);
  xhr.withCredentials = true;

  xhr.addEventListener("readystatechange", function () {
    if (xhr.readyState !== XMLHttpRequest.DONE) return;

    callback(xhr.status, xhr.responseText);
  });

  if (body) {
    xhr.setRequestHeader("Content-type", "application/json; charset=utf8");
    xhr.send(JSON.stringify(body));
    return;
  }

  xhr.send();
}

const state = {
  activeMenuLink: null,
  menuElements: {},
};

const config = {
  menu: {
    feed: {
      href: "/feed",
      text: "Лента",
      render: renderFeed,
    },
    login: {
      href: "/login",
      text: "Авторизация",
      render: renderLogin,
    },
    signup: {
      href: "/signup",
      text: "Регистрация",
      render: renderSignup,
    },
    profile: {
      href: "/profile",
      text: "Профиль",
      render: renderProfile,
    },
  },
};

function renderMenu() {
  Object.entries(config.menu).forEach(([key, { href, text }], index) => {
    const menuElement = document.createElement("a");
    menuElement.href = href;
    menuElement.textContent = text;

    menuElement.dataset.section = key;
    state.menuElements[key] = menuElement;

    menuContatiner.appendChild(menuElement);
  });

  menuContatiner.addEventListener(
    "click",
    (event) => {
      const { target } = event;

      if (target.tagName.toLowerCase() === "a") {
        event.preventDefault();
        goToPage(target);
      }
    },
    true,
  );
}

function renderLogin() {
  const form = document.createElement("form");
  const emailInput = createInput("email", "Email", "email");
  const passwordInput = createInput("password", "Пароль", "password");
  const submitButton = document.createElement("input");
  submitButton.type = "submit";
  submitButton.value = "Войти!";

  form.appendChild(emailInput);
  form.appendChild(passwordInput);
  form.appendChild(submitButton);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    ajax("POST", "/login", { email, password }, (status, responseString) => {
      if (status === 200) {
        goToPage(state.menuElements.profile);
        return;
      }
      alert(JSON.parse(responseString).error);
    });
  });

  return form;
}

function renderFeed() {
  const feed = document.createElement("div");
  ajax("GET", "/feed", null, (status, response) => {
    const isAuthorized = status === 200;
    if (!isAuthorized) {
      goToPage(state.menuElements.login);
      return;
    }

    const images = JSON.parse(response);

    if (images && Array.isArray(images)) {
      const div = document.createElement("div");
      feed.appendChild(div);

      images.forEach(({ src, likes, id }) => {
        div.innerHTML += `<img src="${src}" alt="image" width="500">`;

        const likeContainer = document.createElement("div");
        div.appendChild(likeContainer);

        likeContainer.innerHTML = `<span>${likes} лайков</span>`;
      });
    }
  });

  return feed;
}

function renderProfile() {
  const profileElement = document.createElement("div");

  ajax("GET", "/me", null, (status, responseString) => {
    const isAuthorized = status === 200;

    if (!isAuthorized) {
      alert("Нет авторизации!");
      goToPage(state.menuElements.login);
      return;
    }

    const { email, age, images } = JSON.parse(responseString);

    const span = document.createElement("span");
    span.textContent = `${email}: ${age} лет`;
    profileElement.appendChild(span);

    if (images && Array.isArray(images)) {
      const div = document.createElement("div");

      images.forEach(({ src, likes }) => {
        div.innerHTML += `<div><img src="${src}" width="500"/></div><div>${likes}</div>`;
      });

      profileElement.appendChild(div);
    }
  });

  return profileElement;
}

function renderSignup() {
  const form = document.createElement("form");
  const emailInput = createInput("email", "Email", "email");
  const ageInput = createInput("number", "Возраст", "age");
  const passwordInput = createInput("password", "Пароль", "password");
  const submitButton = document.createElement("input");
  submitButton.type = "submit";
  submitButton.value = "Зарегистрироваться!";

  form.appendChild(emailInput);
  form.appendChild(passwordInput);
  form.appendChild(ageInput);
  form.appendChild(submitButton);

  return form;
}

function changeActiveLink(newActiveLink) {
  state.activeMenuLink?.classList.remove("active");
  newActiveLink.classList.add("active");
  state.activeMenuLink = newActiveLink;
}

function goToPage(menuElement) {
  pageElement.innerHTML = "";
  changeActiveLink(menuElement);
  const element = config.menu[menuElement.dataset.section].render();
  pageElement.appendChild(element);
}

renderMenu();
goToPage(state.menuElements.feed);
