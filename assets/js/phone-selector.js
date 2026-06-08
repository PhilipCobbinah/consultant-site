/* ===== AFRICAN COUNTRY PHONE SELECTOR ===== */

// Comprehensive list of African countries with flags and dialing codes
const AFRICAN_COUNTRIES = [
  { name: 'Algeria', code: '213', flag: '🇩🇿' },
  { name: 'Angola', code: '244', flag: '🇦🇴' },
  { name: 'Benin', code: '229', flag: '🇧🇯' },
  { name: 'Botswana', code: '267', flag: '🇧🇼' },
  { name: 'Burkina Faso', code: '226', flag: '🇧🇫' },
  { name: 'Burundi', code: '257', flag: '🇧🇮' },
  { name: 'Cameroon', code: '237', flag: '🇨🇲' },
  { name: 'Cape Verde', code: '238', flag: '🇨🇻' },
  { name: 'Central African Republic', code: '236', flag: '🇨🇫' },
  { name: 'Chad', code: '235', flag: '🇹🇩' },
  { name: 'Comoros', code: '269', flag: '🇰🇲' },
  { name: 'Congo', code: '242', flag: '🇨🇬' },
  { name: 'Democratic Republic of the Congo', code: '243', flag: '🇨🇩' },
  { name: 'Côte d\'Ivoire', code: '225', flag: '🇨🇮' },
  { name: 'Djibouti', code: '253', flag: '🇩🇯' },
  { name: 'Egypt', code: '20', flag: '🇪🇬' },
  { name: 'Equatorial Guinea', code: '240', flag: '🇬🇶' },
  { name: 'Eritrea', code: '291', flag: '🇪🇷' },
  { name: 'Eswatini', code: '268', flag: '🇸🇿' },
  { name: 'Ethiopia', code: '251', flag: '🇪🇹' },
  { name: 'Gabon', code: '241', flag: '🇬🇦' },
  { name: 'Gambia', code: '220', flag: '🇬🇲' },
  { name: 'Ghana', code: '233', flag: '🇬🇭' },
  { name: 'Guinea', code: '224', flag: '🇬🇳' },
  { name: 'Guinea-Bissau', code: '245', flag: '🇬🇼' },
  { name: 'Kenya', code: '254', flag: '🇰🇪' },
  { name: 'Lesotho', code: '266', flag: '🇱🇸' },
  { name: 'Liberia', code: '231', flag: '🇱🇷' },
  { name: 'Libya', code: '218', flag: '🇱🇾' },
  { name: 'Madagascar', code: '261', flag: '🇲🇬' },
  { name: 'Malawi', code: '265', flag: '🇲🇼' },
  { name: 'Mali', code: '223', flag: '🇲🇱' },
  { name: 'Mauritania', code: '222', flag: '🇲🇷' },
  { name: 'Mauritius', code: '230', flag: '🇲🇺' },
  { name: 'Morocco', code: '212', flag: '🇲🇦' },
  { name: 'Mozambique', code: '258', flag: '🇲🇿' },
  { name: 'Namibia', code: '264', flag: '🇳🇦' },
  { name: 'Niger', code: '227', flag: '🇳🇪' },
  { name: 'Nigeria', code: '234', flag: '🇳🇬' },
  { name: 'Rwanda', code: '250', flag: '🇷🇼' },
  { name: 'Sao Tome and Principe', code: '239', flag: '🇸🇹' },
  { name: 'Senegal', code: '221', flag: '🇸🇳' },
  { name: 'Seychelles', code: '248', flag: '🇸🇨' },
  { name: 'Sierra Leone', code: '232', flag: '🇸🇱' },
  { name: 'Somalia', code: '252', flag: '🇸🇴' },
  { name: 'South Africa', code: '27', flag: '🇿🇦' },
  { name: 'South Sudan', code: '211', flag: '🇸🇸' },
  { name: 'Sudan', code: '249', flag: '🇸🇩' },
  { name: 'Tanzania', code: '255', flag: '🇹🇿' },
  { name: 'Togo', code: '228', flag: '🇹🇬' },
  { name: 'Tunisia', code: '216', flag: '🇹🇳' },
  { name: 'Uganda', code: '256', flag: '🇺🇬' },
  { name: 'Zambia', code: '260', flag: '🇿🇲' },
  { name: 'Zimbabwe', code: '263', flag: '🇿🇼' }
];

// Phone number validation rules by country (min-max length without country code)
const PHONE_VALIDATION = {
  '233': { min: 9, max: 9, example: '241234567' },  // Ghana
  '234': { min: 10, max: 10, example: '8031234567' }, // Nigeria
  '254': { min: 9, max: 9, example: '712345678' },   // Kenya
  '256': { min: 9, max: 9, example: '712345678' },   // Uganda
  '255': { min: 9, max: 9, example: '612345678' },   // Tanzania
  '250': { min: 9, max: 9, example: '788123456' },   // Rwanda
  '251': { min: 9, max: 9, example: '911234567' },   // Ethiopia
  '20':  { min: 10, max: 10, example: '1001234567' }, // Egypt
  '237': { min: 9, max: 9, example: '691234567' },   // Cameroon
  '221': { min: 9, max: 9, example: '701234567' },   // Senegal
  '225': { min: 10, max: 10, example: '0701234567' }, // Côte d'Ivoire
  '226': { min: 8, max: 8, example: '70123456' },    // Burkina Faso
  '228': { min: 8, max: 8, example: '90123456' },    // Togo
  '229': { min: 8, max: 8, example: '90123456' },    // Benin
  '27':  { min: 9, max: 9, example: '701234567' },   // South Africa
  '212': { min: 9, max: 9, example: '601234567' },   // Morocco
  '216': { min: 8, max: 8, example: '20123456' },    // Tunisia
  '218': { min: 9, max: 9, example: '901234567' },   // Libya
  '220': { min: 7, max: 7, example: '2341234' },     // Gambia
  '222': { min: 8, max: 8, example: '40123456' },    // Mauritania
  '223': { min: 8, max: 8, example: '60123456' },    // Mali
  '224': { min: 8, max: 8, example: '60123456' },    // Guinea
  '232': { min: 8, max: 8, example: '30123456' },    // Sierra Leone
};

// Initialize the phone selector
(function initPhoneSelector() {
  const countryBtn = document.getElementById('countrySelectorBtn');
  const countryDropdown = document.getElementById('countryDropdown');
  const countrySearch = document.getElementById('countrySearch');
  const countryList = document.getElementById('countryList');
  const phoneNumberInput = document.getElementById('phoneNumber');
  const fullPhoneInput = document.getElementById('fullPhoneNumber');

  if (!countryBtn || !phoneNumberInput) {
    console.warn('Phone selector elements not found');
    return;
  }

  let selectedCountry = AFRICAN_COUNTRIES.find(c => c.code === '233'); // Default: Ghana

  // Populate country list
  function renderCountryList(filter = '') {
    const filtered = AFRICAN_COUNTRIES.filter(country =>
      country.name.toLowerCase().includes(filter.toLowerCase()) ||
      country.code.includes(filter)
    );

    countryList.innerHTML = filtered.map(country => `
      <li class="country-option ${country.code === selectedCountry.code ? 'selected' : ''}" 
          data-code="${country.code}" 
          role="option"
          aria-selected="${country.code === selectedCountry.code}">
        <span class="country-option-flag">${country.flag}</span>
        <div class="country-option-details">
          <span class="country-option-name">${country.name}</span>
          <span class="country-option-code">+${country.code}</span>
        </div>
      </li>
    `).join('');

    // Add click handlers to options
    countryList.querySelectorAll('.country-option').forEach(option => {
      option.addEventListener('click', () => selectCountry(option.dataset.code));
    });
  }

  // Update the button display
  function updateButtonDisplay() {
    const btn = countryBtn;
    btn.innerHTML = `
      <span class="country-flag">${selectedCountry.flag}</span>
      <span class="country-info">
        <span class="country-name">${selectedCountry.name}</span>
        <span class="country-code">+${selectedCountry.code}</span>
      </span>
      <span class="selector-arrow">▼</span>
    `;
    updatePhonePlaceholder();
    updateFullPhoneNumber();
  }

  // Update phone input placeholder based on country
  function updatePhonePlaceholder() {
    const rule = PHONE_VALIDATION[selectedCountry.code] || { example: 'Enter phone number' };
    phoneNumberInput.placeholder = rule.example;
  }

  // Update the full phone number (country code + phone)
  function updateFullPhoneNumber() {
    if (phoneNumberInput.value) {
      fullPhoneInput.value = `+${selectedCountry.code}${phoneNumberInput.value}`;
    } else {
      fullPhoneInput.value = '';
    }
  }

  // Select a country
  function selectCountry(code) {
    selectedCountry = AFRICAN_COUNTRIES.find(c => c.code === code);
    updateButtonDisplay();
    renderCountryList(countrySearch.value); // Re-render to show selected
    closeDropdown();
    phoneNumberInput.focus();
    console.log(`📍 Country selected: ${selectedCountry.name} (+${selectedCountry.code})`);
  }

  // Open dropdown
  function openDropdown() {
    countryDropdown.classList.add('active');
    countryBtn.classList.add('active');
    countrySearch.focus();
    console.log('📂 Country dropdown opened');
  }

  // Close dropdown
  function closeDropdown() {
    countryDropdown.classList.remove('active');
    countryBtn.classList.remove('active');
    countrySearch.value = '';
    console.log('📂 Country dropdown closed');
  }

  // Toggle dropdown
  function toggleDropdown() {
    if (countryDropdown.classList.contains('active')) {
      closeDropdown();
    } else {
      openDropdown();
    }
  }

  // Country button click
  countryBtn.addEventListener('click', toggleDropdown);

  // Country search filter
  countrySearch.addEventListener('input', (e) => {
    renderCountryList(e.target.value);
  });

  // Phone number input - validate and format
  phoneNumberInput.addEventListener('input', (e) => {
    let value = e.target.value;
    
    // Remove any non-numeric characters
    value = value.replace(/[^\d]/g, '');
    
    // Prevent manually entering country code
    if (value.startsWith(selectedCountry.code)) {
      value = value.slice(selectedCountry.code.length);
    }
    
    // Limit to max length
    const rule = PHONE_VALIDATION[selectedCountry.code];
    if (rule && value.length > rule.max) {
      value = value.slice(0, rule.max);
    }
    
    e.target.value = value;
    updateFullPhoneNumber();
  });

  // Phone number validation on blur
  phoneNumberInput.addEventListener('blur', () => {
    const value = phoneNumberInput.value;
    if (value) {
      const rule = PHONE_VALIDATION[selectedCountry.code];
      if (rule && (value.length < rule.min || value.length > rule.max)) {
        phoneNumberInput.classList.add('error');
        console.warn(`❌ Invalid phone number length for ${selectedCountry.name}`);
      } else {
        phoneNumberInput.classList.remove('error');
      }
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.country-selector-wrapper') && 
        !e.target.closest('.phone-number-input')) {
      closeDropdown();
    }
  });

  // Close dropdown with ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && countryDropdown.classList.contains('active')) {
      closeDropdown();
    }
  });

  // Keyboard navigation in dropdown
  countrySearch.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const options = countryList.querySelectorAll('.country-option');
      if (options.length === 0) return;

      const currentIndex = Array.from(options).findIndex(
        opt => opt.classList.contains('selected')
      );

      let newIndex = e.key === 'ArrowDown' ? currentIndex + 1 : currentIndex - 1;
      if (newIndex < 0) newIndex = options.length - 1;
      if (newIndex >= options.length) newIndex = 0;

      options[newIndex].focus();
      selectCountry(options[newIndex].dataset.code);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const focused = countryList.querySelector('.country-option:focus');
      if (focused) {
        selectCountry(focused.dataset.code);
      }
    }
  });

  // Phone input - Allow Enter to move to next field
  phoneNumberInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Move to next form field
      const form = phoneNumberInput.closest('form');
      if (form) {
        const formElements = Array.from(form.querySelectorAll('input, select, textarea, button'));
        const currentIndex = formElements.indexOf(phoneNumberInput);
        if (currentIndex < formElements.length - 1) {
          formElements[currentIndex + 1].focus();
        }
      }
    }
  });

  // Initialize display
  updateButtonDisplay();
  renderCountryList();

  console.log('✅ Phone selector initialized');
  console.log(`📍 Default country: ${selectedCountry.name} (+${selectedCountry.code})`);
})();
