// ==UserScript==
// @name         YouTube Live Chat Judi Online Blocker
// @namespace    javascript
// @version      1.0
// @description  Memblokir pesan yang berkaitan dengan promosi judi online (judol) di live stream YouTube
// @author       Okki Dwi | https://linktr.ee/okkidwi
// @match        https://www.youtube.com/live_chat*
// @icon         https://raw.githubusercontent.com/okkidwi/cek-status-data-sptjm-sr-kampus-merdeka/main/images/icon-kampus-merdeka.png
// @license      GNU GPLv3
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let isActive = true;

    let rules = [
        {type: "contains", text: "maxwin"},
        {type: "contains", text: "jackpot"},
        {type: "contains", text: "petir"},
        {type: "contains", text: "zeus"},
        {type: "contains", text: "kakek"},
        {type: "contains", text: "gacor"},
        {type: "contains", text: "wd"},
        {type: "contains", text: "wede"},
        {type: "contains", text: "depo"},
        {type: "contains", text: "web"},
        {type: "contains", text: "situs"}
    ];

    const elName = {
        yt: {
            messageTag: "yt-live-chat-text-message-renderer",
            messageClass: "yt-live-chat-item-list-renderer"
        },
        ytlcb: {
            filteredItemClass: "ytlcb-filtered-item"
        }
    };

    const normalizeText = (text) => {
        return text.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
    };

    const filter = (nodes) => {
        nodes.forEach(node => {
            let message = ((node.querySelector("#message") || []).textContent || "");

            message = normalizeText(message);

            const matched = rules.some(rule => {
                switch (rule.type) {
                    case "contains":
                        return message.toLowerCase().includes(rule.text.toLowerCase());
                    case "equals":
                        return message.toLowerCase() === rule.text.toLowerCase();
                    case "regexp":
                        const regexp = new RegExp(rule.text, "i");
                        return regexp.test(message);
                    default:
                        return false;
                }
            });

            if (matched) {
                node.classList.add(elName.ytlcb.filteredItemClass);
            }
        });
    };

    const filterAll = () => {
        const nodes = document.querySelectorAll(`${elName.yt.messageTag}.${elName.yt.messageClass}`);

        nodes.forEach(node => node.classList.remove(elName.ytlcb.filteredItemClass));
        if (isActive && rules.length !== 0) {
            filter(nodes);
        }
    };

    const init = () => {
        const style = document.createElement("style");
        style.textContent = `
            ${elName.yt.messageTag}.${elName.ytlcb.filteredItemClass} {
                display: none !important;
            }
        `;
        document.head.appendChild(style);

        const chatListNode = document.querySelector("#chat");

        if (chatListNode) {
            filterAll();
            const chatObserver = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    const chatNodes = [...mutation.addedNodes].filter(node => {
                        return node.nodeType === Node.ELEMENT_NODE && node.classList.contains(elName.yt.messageClass);
                    });
                    filter(chatNodes);
                });
            });

            chatObserver.observe(chatListNode, { childList: true, subtree: true });
        }

        addToggleButton();
    };

    const addToggleButton = () => {
        const header = document.querySelector("#header-author") || document.querySelector("#chat-messages");
        if (header) {
            const button = document.createElement("button");
            button.textContent = isActive ? "Filter Judi Online : AKTIF" : "Filter Judi Online : NONAKTIF";
            button.style.position = "absolute";
            button.style.top = "6px";
            button.style.right = "10px";
            button.style.zIndex = "1000";
            button.style.backgroundColor = isActive ? "#4CAF50" : "#f44336";
            button.style.color = "white";
            button.style.border = "none";
            button.style.padding = "10px";
            button.style.cursor = "pointer";
            button.style.borderRadius = "10px";
            button.style.fontWeight = "bold";

            button.addEventListener('click', () => {
                isActive = !isActive;
                button.textContent = isActive ? "Filter Judi Online : AKTIF" : "Filter Judi Online : NONAKTIF";
                button.style.backgroundColor = isActive ? "#4CAF50" : "#f44336";
                filterAll();
            });

            header.appendChild(button);
        }
    };

    window.addEventListener('load', init);

})();
