const cart = new Map();
const SERVICE_FEE = 7;
const WHATSAPP_NUMBER = "+917276739369"; // Replace with your WhatsApp number in international format without '+' or dashes

const cartItemsEl = document.getElementById("cartItems");
const subtotalEl = document.getElementById("subtotal");
const serviceFeeEl = document.getElementById("serviceFee");
const grandTotalEl = document.getElementById("grandTotal");
const orderForm = document.getElementById("orderForm");
const orderSummaryInput = document.getElementById("orderSummary");
const orderPreview = document.getElementById("orderPreview");
const modal = document.getElementById("orderModal");
const whatsappLink = document.getElementById("whatsappLink");
const copyOrderBtn = document.getElementById("copyOrderBtn");
const closeModalBtn = document.getElementById("closeModalBtn");

const inr = (value) => `Rs ${value}`;

const getTotals = () => {
  let subtotal = 0;

  for (const item of cart.values()) {
    subtotal += item.price * item.qty;
  }

  const service = subtotal > 0 ? SERVICE_FEE : 0;
  const total = subtotal + service;

  return { subtotal, service, total };
};

const buildOrderLines = () => {
  const lines = [];

  for (const item of cart.values()) {
    lines.push(`${item.name} x ${item.qty} = ${inr(item.price * item.qty)}`);
  }

  return lines;
};

const syncHiddenOrderSummary = () => {
  const lines = buildOrderLines();
  orderSummaryInput.value = lines.join(" | ");
};

const addToCart = (name, price) => {
  const existing = cart.get(name);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.set(name, { name, price, qty: 1 });
  }

  renderCart();
};

const updateQuantity = (name, direction) => {
  const item = cart.get(name);

  if (!item) {
    return;
  }

  item.qty += direction;

  if (item.qty <= 0) {
    cart.delete(name);
  }

  renderCart();
};

const renderCart = () => {
  const { subtotal, service, total } = getTotals();

  if (cart.size === 0) {
    cartItemsEl.innerHTML = '<li class="cart-empty">No cups yet. Tap Add + in the menu to start.</li>';
  } else {
    const cartMarkup = Array.from(cart.values())
      .map(
        (item) => `
          <li class="cart-item">
            <div>
              <div class="cart-item-name">${item.name}</div>
              <div class="cart-item-meta">${inr(item.price)} each</div>
            </div>
            <div class="qty-group" aria-label="Quantity controls for ${item.name}">
              <button type="button" class="qty-btn" data-item="${item.name}" data-dir="-1">-</button>
              <strong>${item.qty}</strong>
              <button type="button" class="qty-btn" data-item="${item.name}" data-dir="1">+</button>
            </div>
          </li>
        `
      )
      .join("");

    cartItemsEl.innerHTML = cartMarkup;
  }

  subtotalEl.textContent = inr(subtotal);
  serviceFeeEl.textContent = inr(service);
  grandTotalEl.textContent = inr(total);

  syncHiddenOrderSummary();
};

const openModal = () => {
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
};

const closeModal = () => {
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
};

const bindMenuButtons = () => {
  const addButtons = document.querySelectorAll(".add-btn");

  addButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".menu-card");

      if (!card) {
        return;
      }

      const name = card.dataset.name;
      const price = Number(card.dataset.price);

      if (!name || Number.isNaN(price)) {
        return;
      }

      addToCart(name, price);
      button.textContent = "Added";
      setTimeout(() => {
        button.textContent = "Add +";
      }, 700);
    });
  });
};

const bindCartControls = () => {
  cartItemsEl.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof HTMLButtonElement)) {
      return;
    }

    if (!target.classList.contains("qty-btn")) {
      return;
    }

    const name = target.dataset.item;
    const direction = Number(target.dataset.dir);

    if (!name || Number.isNaN(direction)) {
      return;
    }

    updateQuantity(name, direction);
  });
};

const bindOrderSubmit = () => {
  orderForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (cart.size === 0) {
      window.alert("Please add at least one coffee to the cart before placing your order.");
      return;
    }

    const { subtotal, service, total } = getTotals();

    const studentName = document.getElementById("studentName").value.trim();
    const collegeName = document.getElementById("collegeName").value.trim();
    const dropSpot = document.getElementById("dropSpot").value.trim();
    const phoneNumber = document.getElementById("phoneNumber").value.trim();
    const orderNote = document.getElementById("orderNote").value.trim();

    const messageLines = [
      "Coffee Seventh Sip - Campus Order",
      "",
      `Name: ${studentName}`,
      `College: ${collegeName}`,
      `Drop Spot: ${dropSpot}`,
      `Phone: ${phoneNumber}`,
      "",
      "Items:",
      ...buildOrderLines(),
      "",
      `Subtotal: ${inr(subtotal)}`,
      `Campus Service: ${inr(service)}`,
      `Total: ${inr(total)}`,
      orderNote ? `Notes: ${orderNote}` : "Notes: None",
      `Order Time: ${new Date().toLocaleString()}`,
    ];

    const finalMessage = messageLines.join("\n");

    orderPreview.textContent = finalMessage;
    whatsappLink.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(finalMessage)}`;

    openModal();
  });
};

const bindModalControls = () => {
  closeModalBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  copyOrderBtn.addEventListener("click", async () => {
    const text = orderPreview.textContent;

    if (!text) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      copyOrderBtn.textContent = "Copied";
      setTimeout(() => {
        copyOrderBtn.textContent = "Copy Text";
      }, 1100);
    } catch {
      window.alert("Unable to copy automatically. Please copy the order text manually.");
    }
  });
};

const setupRevealAnimation = () => {
  const revealItems = document.querySelectorAll(".reveal");

  if (revealItems.length === 0) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
    }
  );

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 60, 320)}ms`;
    observer.observe(item);
  });
};

const setFooterYear = () => {
  const yearElement = document.getElementById("year");

  if (yearElement) {
    yearElement.textContent = String(new Date().getFullYear());
  }
};

bindMenuButtons();
bindCartControls();
bindOrderSubmit();
bindModalControls();
setupRevealAnimation();
setFooterYear();
renderCart();
