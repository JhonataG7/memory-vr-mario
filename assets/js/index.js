// Versão sem jQuery, usando DOMContentLoaded
document.addEventListener("DOMContentLoaded", function () {
  // Pega o código da URL atual
  let userCode = window.location.search;
  userCode = userCode.replace("?", "");
  console.log("Código na URL:", userCode);

  // Salva no localStorage
  if (userCode) {
    localStorage.setItem("userCode", userCode);
    console.log("Código do usuário salvo:", userCode);
  }
});

// --- Variáveis Globais (DOM Elements) ---
const cena = document.querySelector("#cena");
const gameContainer = document.querySelector("#game-container");
const initialInterface = document.querySelector("a-plane#initialInterface");
const title = document.querySelector("a-text#title");
const subTitle = document.querySelector("a-text#subTitle");
const gameButton = document.querySelector("a-cylinder#gameButton");
const powerIcon = document.querySelector("a-image#powerIcon");
const blackboard = document.querySelector("a-plane#blackboard");
const resetBox = document.querySelector("a-box#resetBox");
const boxTime = document.querySelector("a-box#boxTime");
let gameTime = document.querySelector("a-text#gameTime");

// >>> NOVO: Variável para o elemento de som (ID: gameMusic, ajustado no HTML)
const gameMusic = document.querySelector("#gameMusic"); 

// --- Variáveis de Estado do Jogo ---
let intervalTempo;
let tempo;
let cardBefore = null;
let hits = 0;
let errors = 0;


if (gameButton && gameMusic) {
  gameButton.addEventListener("click", function () {
    if (gameMusic.components && gameMusic.components.sound) {
      gameMusic.components.sound.playSound();
    }
  });
}

// --- Configuração e Eventos Iniciais ---
window.addEventListener("load", () => {

  // Adiciona o evento de mouseenter no botão de reset
  resetBox.addEventListener("mouseenter", () => {
    // Remove o texto ou plane de score, se existir
    let scorePlane = blackboard.querySelector("a-plane");
    if (scorePlane) scorePlane.remove();
    
    resetBox.setAttribute("visible", "false");
    resetBox.classList.remove("raycastable");

    hits = 0;
    errors = 0;
    clearBlackboard();
    newGame();
  });

  // Adiciona o evento de CLICK (mais robusto para áudio) no botão de iniciar
  gameButton.addEventListener("click", () => { // <--- MUDANÇA: 'click' para iniciar jogo e áudio
    
    // >>> INICIA A MÚSICA AQUI (Solução Autoplay) <<<
    // Verifica se o componente 'sound' existe e se a música não está tocando
    if (gameMusic && gameMusic.components.sound && !gameMusic.components.sound.isPlaying) {
        // Usa o método playSound() do componente A-Frame Sound
        gameMusic.components.sound.playSound();
        console.log("Música iniciada após interação do usuário.");
    }
    // ----------------------------------------------------
    
    gameButton.setAttribute("visible", "false");
    powerIcon.setAttribute("visible", "false");
    title.setAttribute("visible", "false");
    subTitle.setAttribute("visible", "false");

    // Faz a initialInterface sumir
    initialInterface.setAttribute("animation", {
      property: "material.opacity",
      to: 0,
      dur: 500,
    });

    setTimeout(() => {
      // Remove a initialInterface
      initialInterface.remove();

      // Rotaciona a blackboard
      blackboard.setAttribute("animation", {
        property: "rotation",
        to: "0 40 0",
        dur: 700,
      });

      setTimeout(() => {
        // Posiciona a blackboard
        blackboard.setAttribute("animation", {
          property: "position",
          to: "-6.3 0 -5",
          dur: 700,
        });

        setTimeout(() => {
          // Atraso para o tempo aparecer um pouco depois da animação do início do jogo
          setTimeout(() => {
            boxTime.setAttribute("visible", "true");
          }, 1300);

          // Atraso para que a animação de início do jogo aconteça depois da animação da blackboard
          newGame();
        }, 1000);
      }, 1200);
    }, 800);
  });
});

// --- Funções do Jogo ---

/**
 * Anima a remoção dos cards e limpa o container do jogo.
 * @returns {Promise<void>}
 */
function resetGame() {
  return new Promise((resolve) => {
    // Limpa o display de tempo
    boxTime.setAttribute("color", "#d40202");
    gameTime.setAttribute("color", "#eee");

    // Efeitos visuais da blackboard
    blackboard.setAttribute("color", "#333");
    setTimeout(() => {
      blackboard.setAttribute("material", "opacity: 1");
    }, 500);

    // Revela o brain-icon, para que a blackboard não fique vazia
    let brainIcon = blackboard.querySelector("a-image");
    if (brainIcon) brainIcon.setAttribute("visible", "true");

    let cards = gameContainer.querySelectorAll(".item");
    let tamanho = cards.length - 1;
    let intervalApagar = setInterval(() => {
      // Animação de opacidade para sumir
      cards[tamanho].setAttribute("material", "opacity: 0");
      let cardImage = cards[tamanho].querySelector("a-image");
      if (cardImage) cardImage.setAttribute("material", "opacity: 0");

      tamanho--;

      if (tamanho < 0) {
        clearInterval(intervalApagar);

        // Excluir os cards (com um atraso para dar tempo da animação terminar)
        setTimeout(() => {
          while (gameContainer.firstChild) {
            gameContainer.removeChild(gameContainer.firstChild);
          }
          resolve();
        }, 300); // Atraso ajustado
      }
    }, 100); // Intervalo ajustado
  });
}

/**
 * Inicia um novo jogo.
 */
function newGame() {
  // Gera as imagens de cards (20 itens para 10 pares) a partir de cardsDefinitions
  const cardImages = cardsDefinitions
  .flatMap(({ src }) => [src, src]) // duplica cada imagem para formar o par
  .sort(() => 0.5 - Math.random()); // Embaralha a lista

  if (gameContainer.innerHTML === "") {
    createCards(cardImages);
  } else {
    resetGame().then(() => {
      createCards(cardImages);
    });
  }
}

/**
 * Cria os cards A-Frame no gameContainer.
 * @param {string[]} imgs - Array de caminhos de imagem.
 */
function createCards(imgs) {
  const items = [];

  imgs.forEach((img, index) => {
    const aBox = document.createElement("a-box");
    aBox.setAttribute("class", "item");
    aBox.setAttribute("width", "2");
    aBox.setAttribute("height", "2");
    aBox.setAttribute("color", "#79798c");
    aBox.setAttribute(
      "position",
      `${(index % 4) * 2.5 - 2.5} ${-Math.floor(index / 4) * 2.5} 0`
    );
    aBox.setAttribute("rotation", "0 0 0");
    aBox.setAttribute("material", "opacity: 0;");

    const aImage = document.createElement("a-image");
    aImage.setAttribute("src", `${img}`);
    aImage.setAttribute("width", "1.8");
    aImage.setAttribute("height", "1.8");
    aImage.setAttribute("rotation", "0 0 0");
    aImage.setAttribute("position", "0 0 0.95"); // Z um pouco maior para evitar z-fighting
    aImage.setAttribute("material", "opacity: 0;");

    aBox.appendChild(aImage);
    items.push(aBox);
  });

  for (let item of items) {
    gameContainer.appendChild(item);
  }

  // Animação de preenchimento
  let tamanho = 0;
  let intervalPreencher = setInterval(() => {
    items[tamanho].setAttribute("material", "opacity: 1");
    items[tamanho].querySelector("a-image").setAttribute("material", "opacity: 1");

    tamanho++;

    if (tamanho >= items.length) {
      clearInterval(intervalPreencher);

      // Vira os cards para baixo
      setTimeout(() => {
        for (let item of items) {
          item.setAttribute("rotation", "0 180 0"); // Vira para o verso
          item.classList.add("raycastable"); // Habilita a interação
        }

        cardBefore = null;
        tempo = 80;
        clearInterval(intervalTempo); // Garante que não há timer rodando
        addEventoMouse();
      }, 500);
    }
  }, 150);
}

/**
 * Adiciona o evento de mouseenter para virar o card e verificar pares.
 */
function addEventoMouse() {
  let timeoutId;
  // Desabilita todos os eventos anteriores para evitar duplicações
  document.querySelectorAll("a-box.item").forEach((item) => {
    // Remove o listener anterior para evitar duplicidade
    item.removeEventListener("mouseenter", handleMouseEnter);
    item.removeEventListener("mouseleave", handleMouseLeave);
    
    // Adiciona novos listeners
    item.addEventListener("mouseenter", handleMouseEnter);
    item.addEventListener("mouseleave", handleMouseLeave);
  });
  
  function handleMouseEnter(event) {
    const item = event.currentTarget;
    
    timeoutId = setTimeout(() => {
      item.setAttribute("animation", {
        property: "rotation",
        to: "0 0 0",
        dur: 500,
      });

      // Se for o primeiro card
      if (!cardBefore) {
        // Inicia o tempo no PRIMEIRO clique
        if (intervalTempo === undefined) {
          iniciaTempo();
          boxTime.setAttribute("color", "#d40202");
          gameTime.setAttribute("color", "#eee");
        }
        cardBefore = item;
        cardBefore.setAttribute("color", "tomato");
        cardBefore.classList.remove("raycastable");
        return;
      } 
      
      // Se for o segundo card (acerto)
      else if (
        cardBefore.querySelector("a-image").getAttribute("src") ===
        item.querySelector("a-image").getAttribute("src")
      ) {
        item.classList.remove("raycastable");
        item.setAttribute("color", "#73fc03");
        cardBefore.setAttribute("color", "#73fc03");
        
        pararTempo();
        hits++;
        writeBlackboard(item);
        chkWin();
        cardBefore = null;
      } 
      
      // Se for o segundo card (erro)
      else {
        errors++;
        item.setAttribute("color", "tomato");

        // Vira os dois cards de volta
        setTimeout(() => {
          addStyle([item, cardBefore]);
        }, 600);
      }
    }, 600);
  }

  function handleMouseLeave() {
    clearTimeout(timeoutId);
  }
}

/**
 * Para o timer.
 */
function pararTempo() {
  clearInterval(intervalTempo);
  intervalTempo = undefined;

  boxTime.setAttribute("color", "#f5f5f5");
  gameTime.setAttribute("color", "#d40202");
}

/**
 * Inicia o timer do jogo.
 */
function iniciaTempo() {
  // Tempo do Jogo
  intervalTempo = setInterval(() => {
    gameTime.setAttribute("value", `${tempo}`);
    tempo--;

    if (tempo < 0) {
      clearInterval(intervalTempo);
      looseGame();
    }
  }, 1000);
}

/**
 * Calcula a pontuação final do jogo.
 * @param {number} hits - Número de acertos.
 * @param {number} errors - Número de erros.
 * @param {number} tempoUsado - Tempo restante no final do jogo.
 * @param {number} tempoMaximo - Tempo inicial do jogo.
 * @returns {number} O score calculado.
 */
function calculateScore(hits, errors, tempoUsado, tempoMaximo = 80) {
  // O tempo que foi gasto no jogo é o tempo máximo (80) menos o tempo restante (tempoUsado)
  let tempoGasto = tempoMaximo - tempoUsado;
  
  // Pontuação: (Acertos * 10) + (Tempo Restante * 2) - (Erros * 5)
  let score = hits * 10 + tempoUsado * 2 - errors * 5;

  // Garante que o score final não seja negativo
  score = Math.max(score, 0);

  return score;
}

// --- Funções de API e Final de Jogo ---

/**
 * Salva a pontuação do usuário.
 * @param {number} pontos - A pontuação a ser salva.
 */
function saveScores(pontos) {
  console.log("Pontos a serem salvos:", pontos);

  let user = localStorage.getItem("userCode");

  if (!user) {
    console.error("Código do usuário não encontrado no localStorage. Pontuação não será salva.");
    return;
  }

  // 1. Busca o ID do usuário
  fetch(`https://solid-palm-tree-6q6qqgw9grxcrv7x-3000.app.github.dev/users?code=${user}`)
    .then(async (res) => {
      if (!res.ok) throw new Error("Erro ao buscar usuário.");
      return await res.json();
    })
    .then((userArray) => {
      if (!userArray || userArray.length === 0) {
        throw new Error("Usuário não encontrado com o código fornecido.");
      }
      
      const userId = userArray[0].id;
      const scoreData = {
        userId: userId,
        experienceId: 2, // Hardcoded: Verifique se experienceId: 2 está correto.
        score: pontos,
      };

      console.log("Dados de Score para envio:", scoreData);

      // 2. Envia a pontuação
      return fetch(
        `https://solid-palm-tree-6q6qqgw9grxcrv7x-3000.app.github.dev/experienceScores`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(scoreData),
        }
      );
    })
    .then((res) => {
      if (!res.ok) throw new Error(`Falha ao salvar pontuação: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      console.log("Dados enviados com sucesso:", data);
      // Redireciona
      setTimeout(() => {
        window.location.href =
          "https://solid-palm-tree-6q6qqgw9grxcrv7x-3000.app.github.dev/pages/auth";
      }, 10000); // 10 segundos para redirecionar
    })
    .catch((error) => {
      console.error("Erro no processo de salvar scores:", error);
    });
}

/**
 * Função chamada quando o tempo acaba.
 */
function looseGame() {
  // Esvazia a blackboard
  clearBlackboard();
  
  // Efeito de cor de derrota na blackboard
  blackboard.setAttribute("color", "#d6361a");

  // Cria a mensagem de fracasso
  setTimeout(() => {
    const failureText = document.createElement("a-text");
    failureText.setAttribute("color", "#eee");
    failureText.setAttribute("value", "Voce\nPerdeu");
    failureText.setAttribute("shader", "msdf");
    failureText.setAttribute(
      "font",
      "https://raw.githubusercontent.com/etiennepinchon/aframe-fonts/master/fonts/anton/Anton-Regular.json"
    );
    failureText.setAttribute("scale", "3 3 1");
    failureText.setAttribute("position", "-1.4 -0.5 0");
    blackboard.appendChild(failureText);
  }, 300);

  // Retira a interação com os cards
  let cards = document.querySelectorAll(".item");
  for (let card of cards) {
    card.classList.remove("raycastable");
  }

  // Calcula e salva o score
  let tempoUsado = 80 - (tempo > 0 ? tempo : 0); // Ajuste o tempo para o que foi usado
  let score = calculateScore(hits, errors, tempoUsado);
  console.log("Score de Derrota:", score);
  saveScores(score);

  // Mostra o score e o botão de reset
  setTimeout(() => {
    showScore(tempoUsado);
    showResetButton();
  }, 3000);
}

function showResetButton() {
  resetBox.setAttribute("visible", "true");
  resetBox.classList.add("raycastable");
}

/**
 * Preenche a blackboard com a definição do card.
 * @param {AFRAME.Element} card - O card virado.
 */
function writeBlackboard(card) {
  clearBlackboard();

  const cardSrc = card.querySelector("a-image").getAttribute("src");

  const cardData = cardsDefinitions.find(({ src }) => cardSrc === src);

  if (cardData) {
    const { title, definition } = cardData;
    
    // Cria o Título
    const aTitle = document.createElement("a-text");
    aTitle.setAttribute("value", `${title}`);
    aTitle.setAttribute("position", "-1 2 0");
    aTitle.setAttribute("color", "#fff");
    aTitle.setAttribute("scale", "3 3 1");
    aTitle.setAttribute("shader", "msdf");
    aTitle.setAttribute(
      "font",
      "https://raw.githubusercontent.com/etiennepinchon/aframe-fonts/master/fonts/anton/Anton-Regular.json"
    );

    // Cria a Definição
    const aDefinition = document.createElement("a-text");
    aDefinition.setAttribute("color", "#fff");
    aDefinition.setAttribute("anchor", "center");
    aDefinition.setAttribute("scale", "2.5 3 1");
    aDefinition.setAttribute("value", `${definition}`);
    aDefinition.setAttribute("width", "2");
    aDefinition.setAttribute("height", "3");
    aDefinition.setAttribute("position", "0 0 0.3");

    blackboard.appendChild(aTitle);
    blackboard.appendChild(aDefinition);
  }
}

/**
 * Limpa o conteúdo da blackboard.
 */
function clearBlackboard() {
  // Remove o texto e o plano de score
  const scorePlane = blackboard.querySelector("a-plane");
  if (scorePlane) scorePlane.remove();

  // Oculta o ícone do cérebro
  const brain = blackboard.querySelector("a-image");
  if (brain) brain.setAttribute("visible", "false");

  // Remove todos os textos
  const textsBlackboard = blackboard.querySelectorAll("a-text");
  textsBlackboard.forEach((text) => {
    text.remove();
  });
}

/**
 * Aplica o estilo de virar de volta (rotação) após um erro.
 * @param {AFRAME.Element[]} elems - Array com os dois cards para virar.
 */
function addStyle(elems) {
  for (let el of elems) {
    el.setAttribute("animation", {
      property: "rotation",
      to: "0 180 0",
      dur: 500,
    });
  }

  // Espera a animação terminar para resetar as cores e interações
  setTimeout(() => {
    for (let el of elems) {
      el.setAttribute("color", "#79798c");
      el.classList.add("raycastable");
    }
    cardBefore = null; // Libera a jogada
  }, 800); // 500ms da animação + buffer
}

/**
 * Checa se o jogador venceu.
 */
function chkWin() {
  const cards = document.querySelectorAll(".item");
  // Verifica se todos os cards estão com a cor de acerto
  const count = Array.from(cards).filter(
    (card) => card.getAttribute("color") === "#73fc03"
  ).length;

  if (count === cards.length) {
    clearInterval(intervalTempo);

    // Calcula o tempo restante
    let tempoRestante = tempo + 1;
    let score = calculateScore(hits, errors, tempoRestante);
    saveScores(score);
    console.log("Score de Vitória:", score);

    clearBlackboard();
    
    // Efeito visual de vitória
    blackboard.setAttribute("color", "#5bc202");

    const wonText = document.createElement("a-text");
    wonText.setAttribute("color", "#eee");
    wonText.setAttribute("value", "Parabens!");
    wonText.setAttribute("shader", "msdf");
    wonText.setAttribute(
      "font",
      "https://raw.githubusercontent.com/etiennepinchon/aframe-fonts/master/fonts/anton/Anton-Regular.json"
    );
    wonText.setAttribute("scale", "3 3 1");
    wonText.setAttribute("position", "-1.6 -0.5 1");

    blackboard.appendChild(wonText);

    // Mostra o score e o botão de reset
    setTimeout(() => {
      showScore(tempoRestante);
      showResetButton();
    }, 3000);
  }
}

/**
 * Exibe a tela de pontuação na blackboard.
 * @param {number} tempoFinal - O tempo restante ou usado no final do jogo.
 */
function showScore(tempoFinal) {
  clearBlackboard();
  // A opacidade é controlada no looseGame/chkWin, então essa animação é removida.

  const scoreBackground = document.createElement("a-plane");
  scoreBackground.setAttribute("color", "#222");
  scoreBackground.setAttribute("width", "4.9");
  scoreBackground.setAttribute("height", "4.9");
  scoreBackground.setAttribute("position", "0 0 0.5");
  scoreBackground.setAttribute("material", "opacity: 0.8"); // Adicionado opacidade para destaque

  const scoreContainer = document.createElement("a-entity");
  scoreContainer.setAttribute("position", "-2 0 -0.5");

  scoreBackground.appendChild(scoreContainer);

  const titleScore = document.createElement("a-text");
  titleScore.setAttribute("shader", "msdf");
  titleScore.setAttribute(
    "font",
    "https://raw.githubusercontent.com/etiennepinchon/aframe-fonts/master/fonts/anton/Anton-Regular.json"
  );
  titleScore.setAttribute("value", "Score");
  titleScore.setAttribute("scale", "7 7 1");
  titleScore.setAttribute("position", "0 0.7 1");
  titleScore.setAttribute("color", "#e8ac2c");
  titleScore.setAttribute("align", "center");

  const acertos = document.createElement("a-text");
  acertos.setAttribute("value", `Acertos: ${hits}`);
  acertos.setAttribute("position", "0.5 -0.6 1");
  acertos.setAttribute("scale", "2.5 2.5 1");
  acertos.setAttribute("shader", "msdf");
  acertos.setAttribute("color", "#eee");

  const erros = document.createElement("a-text");
  erros.setAttribute("value", `Erros: ${errors}`);
  erros.setAttribute("position", "0.5 0 1");
  erros.setAttribute("scale", "2.5 2.5 1");
  erros.setAttribute("shader", "msdf");
  erros.setAttribute("color", "#eee");

  const tempoJogo = document.createElement("a-text");
  // Exibe o tempo restante no final, que é o valor final de 'tempoFinal'
  tempoJogo.setAttribute("value", `Tempo Restante: ${tempoFinal}`); 
  tempoJogo.setAttribute("position", "0.5 -1.2 1");
  tempoJogo.setAttribute("scale", "2.5 2.5 1");
  tempoJogo.setAttribute("shader", "msdf");
  tempoJogo.setAttribute("color", "#eee");

  scoreContainer.appendChild(titleScore);
  scoreContainer.appendChild(acertos);
  scoreContainer.appendChild(erros);
  scoreContainer.appendChild(tempoJogo);
  blackboard.appendChild(scoreBackground);
}