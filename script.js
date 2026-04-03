const cart = new Map();
const SERVICE_FEE = 7;
const WHATSAPP_NUMBER = "+917276739369"; // Replace with your WhatsApp number in international format without '+' or dashes
const ADD_ONS = [
  { id: "chocolate-crush", name: "Chocolate Crush", price: 5 },
  { id: "extra-cheese", name: "Extra Cheese", price: 10 },
];
const ADD_ON_EXCLUDED_ITEMS = new Set([
  "strawberry shake",
  "lotus biscoff",
  "mango shake",
  "hot chocolate",
  "hot coffee",
]);
const addOnLookup = new Map(ADD_ONS.map((addOn) => [addOn.id, addOn]));

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
const addOnModal = document.getElementById("addonModal");
const addOnForm = document.getElementById("addonForm");
const addOnDrinkNameEl = document.getElementById("addonDrinkName");
const skipAddOnBtn = document.getElementById("skipAddOnBtn");
const closeAddOnBtn = document.getElementById("closeAddOnBtn");
const floatingCartBar = document.getElementById("floatingCartBar");
const floatingCartCountEl = document.getElementById("floatingCartCount");
const floatingCartTotalEl = document.getElementById("floatingCartTotal");

let pendingMenuItem = null;

const inr = (value) => `Rs ${value}`;

const normalizeMenuItemName = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const isAddOnExcludedItem = (name) => ADD_ON_EXCLUDED_ITEMS.has(normalizeMenuItemName(name));
const isPeriPeriFries = (name) => {
  const normalizedName = normalizeMenuItemName(name);
  return normalizedName === "peri peri fries" || normalizedName === "perri perri fries";
};

const setVisibleAddOns = (allowedAddOnIds) => {
  if (!addOnForm) {
    return false;
  }

  const allowedIds = new Set(allowedAddOnIds);
  const addOnItems = addOnForm.querySelectorAll(".add-on-item");
  let visibleCount = 0;

  addOnItems.forEach((item) => {
    const input = item.querySelector('input[name="addon"]');

    if (!input) {
      return;
    }

    const shouldShow = allowedIds.has(input.value);
    item.style.display = shouldShow ? "" : "none";

    if (!shouldShow) {
      input.checked = false;
      return;
    }

    visibleCount += 1;
  });

  return visibleCount > 0;
};

const buildCartKey = (name, addOns) => {
  const addOnIds = addOns.map((addOn) => addOn.id).sort();
  return `${name}__${addOnIds.join("+")}`;
};

const getTotals = () => {
  let subtotal = 0;

  for (const item of cart.values()) {
    subtotal += item.price * item.qty;
  }

  const service = subtotal > 0 ? SERVICE_FEE : 0;
  const total = subtotal + service;

  return { subtotal, service, total };
};

const getTotalItemCount = () => {
  let count = 0;

  for (const item of cart.values()) {
    count += item.qty;
  }

  return count;
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

const addToCart = (name, basePrice, addOns = []) => {
  const itemKey = buildCartKey(name, addOns);
  const addOnLabel = addOns.map((addOn) => addOn.name).join(", ");
  const addOnTotal = addOns.reduce((total, addOn) => total + addOn.price, 0);
  const price = basePrice + addOnTotal;
  const displayName = addOnLabel ? `${name} + ${addOnLabel}` : name;
  const existing = cart.get(itemKey);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.set(itemKey, { key: itemKey, name: displayName, price, qty: 1 });
  }

  renderCart();
};

const updateQuantity = (itemKey, direction) => {
  const item = cart.get(itemKey);

  if (!item) {
    return;
  }

  item.qty += direction;

  if (item.qty <= 0) {
    cart.delete(itemKey);
  }

  renderCart();
};

const openAddOnModal = (name, price, allowedAddOnIds) => {
  if (!addOnModal || !addOnForm || !addOnDrinkNameEl) {
    addToCart(name, price);
    return;
  }

  addOnForm.reset();

  if (!setVisibleAddOns(allowedAddOnIds)) {
    addToCart(name, price);
    pendingMenuItem = null;
    return;
  }

  pendingMenuItem = { name, price };
  addOnDrinkNameEl.textContent = name;
  addOnModal.classList.add("show");
  addOnModal.setAttribute("aria-hidden", "false");
};

const closeAddOnModal = () => {
  if (!addOnModal || !addOnForm) {
    pendingMenuItem = null;
    return;
  }

  addOnModal.classList.remove("show");
  addOnModal.setAttribute("aria-hidden", "true");
  addOnForm.reset();
  pendingMenuItem = null;
};

const getSelectedAddOns = () => {
  if (!addOnForm) {
    return [];
  }

  return Array.from(addOnForm.querySelectorAll('input[name="addon"]:checked'))
    .map((input) => addOnLookup.get(input.value))
    .filter(Boolean);
};

const updateFloatingCartBar = (total) => {
  if (!floatingCartBar || !floatingCartCountEl || !floatingCartTotalEl) {
    return;
  }

  const itemCount = getTotalItemCount();

  if (itemCount <= 0) {
    floatingCartBar.classList.remove("show");
    floatingCartBar.setAttribute("aria-hidden", "true");
    document.body.classList.remove("has-floating-cart");
    return;
  }

  floatingCartCountEl.textContent = `${itemCount} item${itemCount === 1 ? "" : "s"}`;
  floatingCartTotalEl.textContent = inr(total);
  floatingCartBar.classList.add("show");
  floatingCartBar.setAttribute("aria-hidden", "false");
  document.body.classList.add("has-floating-cart");
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
              <button type="button" class="qty-btn" data-item="${item.key}" data-dir="-1">-</button>
              <strong>${item.qty}</strong>
              <button type="button" class="qty-btn" data-item="${item.key}" data-dir="1">+</button>
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
  updateFloatingCartBar(total);

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

      if (card.closest("#coffeeShakesMenu")) {
        if (isAddOnExcludedItem(name)) {
          addToCart(name, price);
          return;
        }

        openAddOnModal(name, price, ["chocolate-crush"]);
        return;
      }

      if (card.closest("#bitesMenu")) {
        openAddOnModal(name, price, ["extra-cheese"]);
        return;
      }

      if (card.closest("#friesMenu")) {
        if (isPeriPeriFries(name)) {
          openAddOnModal(name, price, ["extra-cheese"]);
          return;
        }

        addToCart(name, price);
        return;
      }

      addToCart(name, price);
    });
  });
};

const bindAddOnModal = () => {
  if (!addOnForm || !skipAddOnBtn || !closeAddOnBtn || !addOnModal) {
    return;
  }

  addOnForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!pendingMenuItem) {
      return;
    }

    addToCart(pendingMenuItem.name, pendingMenuItem.price, getSelectedAddOns());
    closeAddOnModal();
  });

  skipAddOnBtn.addEventListener("click", () => {
    if (!pendingMenuItem) {
      return;
    }

    addToCart(pendingMenuItem.name, pendingMenuItem.price);
    closeAddOnModal();
  });

  closeAddOnBtn.addEventListener("click", closeAddOnModal);

  addOnModal.addEventListener("click", (event) => {
    if (event.target === addOnModal) {
      closeAddOnModal();
    }
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
bindAddOnModal();
bindCartControls();
bindOrderSubmit();
bindModalControls();
setupRevealAnimation();
setFooterYear();
renderCart();
