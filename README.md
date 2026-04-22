Aqui está um **README.md completo** (em Markdown) para instalação da sua extensão do Chrome baseada no repositório KeyToken-Manager:

---

# 🔐 KeyToken Manager — Instalação no Google Chrome

Extensão para gerenciamento de tokens diretamente no navegador.

## 📦 Pré-requisitos

* Navegador baseado em Chromium:

  * Google Chrome
  * Microsoft Edge
  * Brave
* Git instalado (opcional, mas recomendado)

---

## 🚀 Instalação

### 1. Clonar o repositório

```bash
git clone https://github.com/CarlosHxH/KeyToken-Manager.git
```

Ou faça o download manual:

* Acesse: [https://github.com/CarlosHxH/KeyToken-Manager](https://github.com/CarlosHxH/KeyToken-Manager)
* Clique em **Code → Download ZIP**
* Extraia o arquivo

---

### 2. Abrir página de extensões do Chrome

No navegador, acesse:

```
chrome://extensions/
```

---

### 3. Ativar modo desenvolvedor

* No canto superior direito, ative:

  * ✅ **Modo do desenvolvedor (Developer Mode)**

---

### 4. Carregar a extensão

* Clique em **"Carregar sem compactação" (Load unpacked)**
* Selecione a pasta do projeto:

```
KeyToken-Manager/
```

---

### 5. Pronto 🎉

A extensão estará instalada e disponível na barra do Chrome.

---

## 🔄 Atualização da extensão

Se fizer alterações no código:

1. Vá em `chrome://extensions/`
2. Clique em **Atualizar (Reload)** na extensão

---

## 🛠️ Estrutura esperada do projeto

```bash
KeyToken-Manager/
├── manifest.json
├── background.js
├── popup.html
├── popup.js
└── assets/
```

---

## 🧪 Troubleshooting

### Extensão não aparece

* Verifique se o `manifest.json` está correto
* Veja erros no console (`F12` → aba *Console*)

### Erro ao carregar

* Confirme se selecionou a pasta raiz correta

---

## 📄 Licença

Consulte o arquivo `LICENSE` do repositório.
