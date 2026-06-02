# DevFlow - Monitor de APIs & Webhooks em Tempo Real

O **DevFlow** é uma plataforma interativa de monitoramento de telemetria e simulação de requisições HTTP e Webhooks em tempo real, projetada com uma interface cibernética moderna de alto desempenho.

Este projeto foi desenvolvido com foco em performance pura, utilizando exclusivamente tecnologias nativas da web (Vanilla Stack) para demonstrar o poder da reatividade sem a necessidade de frameworks pesados.

---

## ⚡ Principais Funcionalidades

*   **Console Terminal Interativo:** Um console estilo root terminal que registra todas as requisições HTTP e payloads de Webhooks. Cada log é interativo e pode ser clicado para expandir os cabeçalhos (`Request Headers`) e o corpo da mensagem (`Request Body`) com realce de sintaxe JSON de forma dinâmica.
*   **Simulador de Requisições HTTP:** Um construtor de requisições integrado que permite disparar requisições manuais do tipo `GET`, `POST`, `PUT` ou `DELETE` contendo payloads JSON customizados.
*   **Monitor de Telemetria:** Cards dinâmicos que exibem o consumo em tempo real de CPU, memória RAM alocada, taxa de requisições por segundo e latência média global.
*   **Gráfico de Latência SVG Fluido:** Um gráfico interativo e responsivo construído em SVG que desenha uma curva bezier suave mapeando todo o histórico de oscilação de latência do sistema.
*   **Gerenciador de Temas:** Customização instantânea da cor de realce da interface com temas pré-definidos (Cyan, Magenta, Purple, Matrix Green, Amber) através de variáveis CSS dinâmicas.
*   **Injetores de Cenários:** Botões de simulação de tráfego de fundo ativo, pico instantâneo de latência de rede e injeção de erro fatal de servidor (Erro 500) para testar os estados de falha e degradação na interface.

---

## 🛠️ Tecnologias Utilizadas

*   **HTML5 Semântico:** Estruturação limpa e otimizada do layout.
*   **CSS3 Custom Properties (Vanilla CSS):** Estilização avançada com Glassmorphism, sombras de neon cibernético, design 100% responsivo e animações fluidas.
*   **Vanilla JavaScript (ES6+):** Lógica reativa de processamento, manipulador de DOM, renderizador do gráfico matemático SVG bezier e motores de simulação de carga de CPU/RAM.

---

## 🚀 Como Executar Localmente

Como o projeto utiliza tecnologias web puras, não é necessária nenhuma etapa de build ou instalação de dependências.

1. Faça o clone do repositório:
   ```bash
   git clone https://github.com/Jefferson-018/Devflow.git
   ```
2. Navegue até a pasta do projeto:
   ```bash
   cd Devflow
   ```
3. Abra o arquivo `index.html` diretamente em qualquer navegador moderno ou utilize uma extensão de Live Server (como no VS Code) para testar.
