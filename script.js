// script.js

// Adiciona um listener de evento ao botão
document.getElementById("searchButton").addEventListener("click", function () {
  const city = document.getElementById("cityInput").value;
  if (city) {
    fetchWeather(city);
  } else {
    alert("Por favor, digite o nome da cidade.");
  }
});
document.addEventListener("keydown", function (event) {
  const city = document.getElementById("cityInput").value;

  if (event.key === "Enter") {
    if (city.trim() === "") {
      alert("Por favor, digite o nome da cidade.");
    } else {
      fetchWeather(city);
      let suggestions = document.querySelector(".suggestions");
      suggestions.style.display = "none";
    }
  }
});

// Adiciona um listener de evento ao campo de entrada para sugestões
document.getElementById("cityInput").addEventListener("input", function () {
  const query = this.value;
  if (query.length > 2) {
    // Inicia a busca apenas quando o usuário digita mais de 2 caracteres
    fetchSuggestions(query);
    let suggestions = document.querySelector(".suggestions");
    suggestions.style.display = "block";
  } else {
    document.getElementById("suggestions").innerHTML = "";
    let suggestions = document.querySelector(".suggestions");
    suggestions.style.display = "none";
  }
});

// Função para buscar sugestões de cidades usando a API Nominatim
function fetchSuggestions(query) {
  fetch(
    `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=5`
  )
    .then((response) => response.json())
    .then((data) => {
      // Processa cada item da resposta e extrai a primeira e última palavra
      const suggestions = data.map((item) => {
        return {
          ...item,
          display_name: getFirstAndLastWords(item.display_name),
        };
      });
      showSuggestions(suggestions);
    })
    .catch((error) => {
      console.error("Erro ao buscar sugestões:", error);
    });
}

// Função para obter a primeira e a última palavra
function getFirstAndLastWords(display_name) {
  // Extrai a parte antes da primeira vírgula
  const firstPart = display_name.split(",")[0].trim();

  // Extrai a última parte após a última vírgula
  const parts = display_name.split(",");
  const lastPart = parts[parts.length - 1].trim();
  const mediumPart = parts[parts.length - 3].trim();

  // Verifica se a primeira parte é válida
  if (firstPart.length === 0) {
    return "";
  } else {
    return `${firstPart} ${"- " + mediumPart} ${"- " + lastPart}`; // Retorna a parte antes da vírgula e a última palavra
  }
}

// Função para exibir as sugestões
function showSuggestions(suggestions) {
  const suggestionsDiv = document.getElementById("suggestions");
  suggestionsDiv.innerHTML = "";
  suggestions.forEach((item) => {
    const div = document.createElement("div");
    div.classList.add("suggestion-item");
    div.textContent = item.display_name; // Exibe a primeira e última palavra
    div.addEventListener("click", () => {
      document.getElementById("cityInput").value = item.display_name; // Usa o nome formatado
      document.getElementById("suggestions").innerHTML = "";
    });
    suggestionsDiv.appendChild(div);
  });
}

// Função para buscar o clima da cidade usando a API Open-Meteo
function fetchWeather(city) {
  fetch(`https://nominatim.openstreetmap.org/search?q=${city}&format=json`)
    .then((response) => response.json())
    .then((data) => {
      if (data.length > 0) {
        const lat = data[0].lat;
        const lon = data[0].lon;
        return fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=America/Sao_Paulo`
        )
          .then((response) => response.json())
          .then((weatherData) => displayWeather(weatherData, city)); // Passa o nome da cidade aqui
      } else {
        throw new Error("Cidade não encontrada");
      }
    })
    .catch((error) => {
      document.getElementById("weatherResult").innerText =
        "Cidade não encontrada ou erro na API.";
      console.error("Erro:", error);
    });
}

function capitalizeCityName(city) {
  // Extrai a parte antes do '-'
  const firstPart = city.split("-")[0].trim();

  // Capitaliza a primeira letra de cada palavra
  const capitalized = firstPart
    .toLowerCase() // Converte toda a string para minúsculas
    .split(" ") // Divide a string em palavras
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Converte a primeira letra de cada palavra em maiúscula
    .join(" "); // Junta as palavras novamente em uma string

  return capitalized;
}

// Função para exibir o clima
function displayWeather(data, city) {
  const formattedCity = capitalizeCityName(city); // Formata o nome da cidade
  if (data.current_weather) {
    const weather = `
                <h2>Clima em ${formattedCity}</h2>
                <p>Temperatura: ${data.current_weather.temperature} °C</p>
                <p>Velocidade do Vento: ${data.current_weather.windspeed} km/h</p>
            `;
    document.getElementById("weatherResult").innerHTML = weather;
    let suggestions = document.querySelector(".suggestions");
    suggestions.style.display = "none"; // Oculta a caixa de sugestões
  } else {
    document.getElementById("weatherResult").innerText =
      "Cidade não encontrada.";
    let suggestions = document.querySelector(".suggestions");
    suggestions.style.display = "none";
  }
}
