const baseUrl = "https://platzi-avo.vercel.app";
const appNode = document.querySelector("#app");
const navigationBars = document.querySelectorAll("header");
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

const formatPrice = price => {
    const newPrice = new window.Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN"
    }).format(price);
    return newPrice;
}

async function obtainProductForId(productId) {
    try {
        const response = await fetch(`${baseUrl}/api/avo`);
        const data = await response.json();
        const product = data.data.find(item => item.id === productId);

        if (product) {
            document.getElementById('product-name').textContent = product.name;
            document.getElementById('product-price').textContent = formatPrice(product.price);
            document.getElementById('product-description').textContent = product.attributes.description;
            document.getElementById('product-image').src = `${baseUrl}${product.image}`;
            document.getElementById('product-sku').textContent = product.sku;

            const productAttributes = document.getElementById('product-attributes');
            productAttributes.innerHTML = '';

            for (const attribute in product.attributes) {
                if (attribute !== 'description') {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td class="px-4 py-2 border-b">${attribute}</td>
                        <td class="px-4 py-2 border-b">${product.attributes[attribute]}</td>
                    `;
                    productAttributes.appendChild(tr);
                }
            }
        } else {
            console.error('Producto no encontrado');
        }
    } catch (error) {
        console.error('Error al obtener los datos:', error);
    }
}

if (productId) {
    obtainProductForId(productId);
}

// Diseño del header
navigationBars.forEach(navigationBar => {
    navigationBar.className = "flex mb-4 border-2 rounded-md shadow-sm justify-around bg-white font-then sticky top-0 z-50";

    const aAvo = document.createElement("a");
    aAvo.className = "items-center p-3 transition duration-100 ease-in-out transform hover:bg-gray-200 hover:shadow-lg focus:bg-gray-300 focus:scale-95";
    aAvo.href = "index.html";
    const aAvoContent = document.createElement("div");
    aAvoContent.className = "flex flex-row items-center";

    const textAvo = document.createElement("div");
    textAvo.textContent = "Avo Store";
    const imgAvo = document.createElement("img");
    imgAvo.src = "media/Avocado_Icon.png";
    imgAvo.className = "object-contain h-10 w-10 ml-2";

    aAvoContent.append(textAvo, imgAvo);
    aAvo.append(aAvoContent);

    const aPanier = document.createElement("a");
    aPanier.className = "items-center p-3 transition duration-100 ease-in-out transform hover:bg-gray-200 hover:shadow-lg focus:bg-gray-300 focus:scale-95";
    aPanier.href = "cartPage.html";
    const aPanierContent = document.createElement("div");
    aPanierContent.className = "flex flex-row items-center";

    const textPanier = document.createElement("div");
    textPanier.textContent = "Panier";
    const imgPanier = document.createElement("img");
    imgPanier.src = "media/panier.png";
    imgPanier.className = "object-contain h-10 w-10 ml-4";

    aPanierContent.append(textPanier, imgPanier);
    aPanier.append(aPanierContent);

    navigationBar.append(aAvo, aPanier);
});

// Diseño de las cards
async function fetchAndDisplayAvos() {
    try {
        const response = await fetch(`${baseUrl}/api/avo`);
        const responseJson = await response.json();
        const allItems = [];
        responseJson.data.map(item => {
            const img = document.createElement("img");
            img.src = `${baseUrl}${item.image}`;
            img.className = "w-full h-auto rounded-lg";

            const title = document.createElement("h2");
            title.className = "text-lg font-body mt-2";
            title.textContent = item.name;

            const price = document.createElement("div");
            price.className = "text-gray-600 font-then mt-1";
            price.textContent = formatPrice(item.price);

            const priceAndTitle = document.createElement("div");
            priceAndTitle.className = "text-center md:text-left mt-3";

            priceAndTitle.appendChild(title);
            priceAndTitle.appendChild(price);

            const card = document.createElement("div");
            card.className = "m-3 rounded-lg shadow-lg p-6 hover:shadow-2xl hover:transform hover:scale-105 transition-transform duration-300 ease-in-out flex flex-col items-center cursor-pointer bg-white";
            card.append(img, priceAndTitle);

            const container = document.createElement("a");
            container.className = "w-full sm:w-1/2 lg:w-1/3 p-4";
            container.href = `avoPage.html?id=${item.id}`;
            container.appendChild(card);

            allItems.push(container);
        });
        appNode.append(...allItems);
    } catch (error) {
        console.error('Error fetching avocados:', error);
    }
}

fetchAndDisplayAvos();

// Carrito de compras
let cart = [];
if (localStorage.getItem("cart")) {
    cart = JSON.parse(localStorage.getItem("cart"));
}

function addToCart(product) {
    cart.push(product);
    localStorage.setItem("cart", JSON.stringify(cart));
    showNotification();
}

const addToCartButton = document.getElementById("add-to-cart-button");
const notification = document.getElementById("notification");

if (addToCartButton) {
    addToCartButton.addEventListener("click", () => {
        const product = {
            id: productId,
            name: document.getElementById('product-name').textContent,
            price: parseFloat(document.getElementById('product-price').textContent.replace(/[^0-9.-]+/g,"")),
            quantity: parseInt(document.getElementById('product-quantity').value),
            image: document.getElementById('product-image').src
        };
        addToCart(product);
    });
}

function showNotification() {
    notification.classList.add("opacity-100");
    setTimeout(() => {
        notification.classList.remove("opacity-100");
    }, 1000); // Desaparece después de 2 segundos
}

// CartPage
document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items');
    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('total');

    if (localStorage.getItem('cart')) {
        cart = JSON.parse(localStorage.getItem('cart'));
    }

    if (cartItemsContainer) {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class ="font-body">No hay productos en el carrito.</p>';
        } else {
            let subtotal = 0;
            cart.forEach(item => {
                const itemContainer = document.createElement('div');
                itemContainer.className = 'flex mb-4 border-b pb-4';

                const img = document.createElement('img');
                img.src = item.image;
                img.className = 'w-20 h-20 rounded-lg mr-4';

                const details = document.createElement('div');
                details.className = 'flex flex-col';

                const name = document.createElement('div');
                name.textContent = item.name;
                name.className = 'font-body';

                const price = document.createElement('div');
                price.textContent = formatPrice(item.price);
                price.className = 'font-then text-gray-600';

                const quantity = document.createElement('div');
                quantity.textContent = `Cantidad: ${item.quantity}`;
                quantity.className = ' font-then text-gray-600';

                subtotal += item.price * item.quantity;

                details.append(name, price, quantity);
                itemContainer.append(img, details);
                cartItemsContainer.appendChild(itemContainer);
            });

            const shipping = 5.00; // Precio fijo de envío
            const taxRate = 0.16; // Tasa de impuestos (16%)
            const tax = subtotal * taxRate;
            const total = subtotal + shipping + tax;

            subtotalElement.textContent = formatPrice(subtotal);
            taxElement.textContent = formatPrice(tax);
            totalElement.textContent = formatPrice(total);

            const buttonClearCart = document.getElementById("clearCart");
            if (buttonClearCart) {
                buttonClearCart.addEventListener("click", () => {
                    localStorage.clear();
                    cartItemsContainer.innerHTML = '<p>No hay productos en el carrito.</p>';
                    subtotalElement.textContent = formatPrice(0);
                    taxElement.textContent = formatPrice(0);
                    totalElement.textContent = formatPrice(0);
                });
            }
        }
    }
});
