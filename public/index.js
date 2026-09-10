var a = document.getElementById('feed');
console.log(a);
a.addEventListener("click", (event) => {
    a.textContent = 'Главная страница инстраграма (запрещен в РФ)';
});