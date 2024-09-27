// ==UserScript==
// @name         YouTube Live Chat Judi Online Blocker
// @namespace    javascript
// @version      1.3
// @description  Memblokir pesan yang berkaitan dengan promosi judi online (judol) di live stream YouTube
// @author       Okki Dwi | https://linktr.ee/okkidwi
// @match        https://www.youtube.com/live_chat*
// @icon         https://raw.githubusercontent.com/okkidwi/YouTube-Live-Chat-Judi-Online-Blocker/refs/heads/main/images/icon-youtube-live-chat-judi-online-blocker.png
// @license      GNU GPLv3
// @grant        none
// @downloadURL  https://update.greasyfork.org/scripts/510410/YouTube%20Live%20Chat%20Judi%20Online%20Blocker.user.js
// @updateURL    https://update.greasyfork.org/scripts/510410/YouTube%20Live%20Chat%20Judi%20Online%20Blocker.meta.js
// ==/UserScript==

(function() {
    'use strict';

    // Status filter aktif/tidak
    let isActive = true;

    // Aturan filter untuk pesan yang berhubungan dengan judi online
    const rules = [
        { type: "regexp", text: "m+\\s*[a4]+\\s*x+\\s*w+\\s*i+\\s*n+" },
        { type: "regexp", text: "j+\\s*[a4]+\\s*c+\\s*k+\\s*p+\\s*[o0]+\\s*t+" },
        { type: "regexp", text: "p+\\s*e+\\s*t+\\s*i+\\s*r+" },
        { type: "regexp", text: "z+\\s*e+\\s*u+\\s*s+" },
        { type: "regexp", text: "k+\\s*[a4]+\\s*k+\\s*e+\\s*k+" },
        { type: "regexp", text: "g+\\s*[a4]+\\s*c+\\s*[o0]+\\s*r+" },
        { type: "regexp", text: "g+\\s*u+\\s*a+\\s*c+\\s*[o0]+\\s*r+" },
        { type: "regexp", text: "w+\\s*d+" },
        { type: "regexp", text: "w+\\s*[e3]+\\s*d+\\s*[e3]+" },
        { type: "regexp", text: "d+\\s*e+\\s*p+\\s*[o0]+" },
        { type: "regexp", text: "w+\\s*[e3]+\\s*b+" },
        { type: "regexp", text: "s+\\s*i+\\s*t+\\s*u+\\s*s+" },
        { type: "regexp", text: "a+\\s*g+\\s*e+\\s*n+" },
        { type: "regexp", text: "m+\\s*[e3]+\\s*m+\\s*b+\\s*[e3]+\\s*r+" },
        { type: "regexp", text: "t+\\s*[e3]+\\s*r+\\s*p+\\s*[e3]+\\s*r+\\s*c+\\s*[a4]+\\s*y+\\s*[a4]+" },
        { type: "regexp", text: "c+\\s*u+\\s*[a4]+\\s*n+" },
        { type: "regexp", text: "r+\\s*u+\\s*n+\\s*g+\\s*k+\\s*[a4]+\\s*t+" },
        { type: "regexp", text: "r+\\s*u+\\s*n+\\s*g+\\s*k+\\s*[a4]+\\s*d+" },
        { type: "regexp", text: "s+\\s*l+\\s*[o0]+\\s*t+\\s*[e3]+\\s*r+" },
        { type: "regexp", text: "c+\\s*h+\\s*i+\\s*p+" },
        { type: "regexp", text: "p+\\s*a+\\s*s+\\s*[a4]+\\s*d+" },
        { type: "regexp", text: "^[\\p{Emoji}].*[\\p{Emoji}]$" },
        { type: "regexp", text: "(\\w[.,_\\-])+\\w" },
        { type: "regexp", text: "\\d{2,}.+|.+\\d{2,}" },
        { type: "regexp", text: "[\\u0300-\\u036f]+" },
        { type: "regexp", text: "[\\p{Extended_Pictographic}\\p{Diacritic}]+", flags: "gu" },
        { type: "regexp", text: "\\p{Math_Symbol}+", flags: "gu" },
    ];

    // Nama elemen yang digunakan di YouTube Live Chat
    const elName = {
        yt: {
            messageTag: "yt-live-chat-text-message-renderer",
            messageClass: "yt-live-chat-item-list-renderer"
        },
        ytlcb: {
            filteredItemClass: "ytlcb-filtered-item"
        }
    };

    // Fungsi untuk menormalisasi teks agar filter lebih akurat
    const normalizeText = (text) => text.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^\p{ASCII}]/gu, "");

    // Filter pesan sesuai aturan yang diberikan
    const filterMessages = (nodes) => {
        nodes.forEach(node => {
            let message = ((node.querySelector("#message") || []).textContent || "");
            message = normalizeText(message);

            const matched = rules.some(rule => {
                const regexp = new RegExp(rule.text, rule.flags || "i");
                return regexp.test(message);
            });

            if (matched) {
                node.classList.add(elName.ytlcb.filteredItemClass);
            }
        });
    };

    // Filter semua pesan yang ada di layar
    const filterAllMessages = () => {
        const nodes = document.querySelectorAll(`${elName.yt.messageTag}.${elName.yt.messageClass}`);
        nodes.forEach(node => node.classList.remove(elName.ytlcb.filteredItemClass));
        if (isActive && rules.length !== 0) {
            filterMessages(nodes);
        }
    };

    // Fungsi untuk menambahkan tombol toggle filter
    const addToggleButton = () => {
        const header = document.querySelector("#header-author") || document.querySelector("#chat-messages");

        if (header) {
            const button = document.createElement("button");
            updateToggleButton(button);

            button.addEventListener('click', () => {
                isActive = !isActive;
                updateToggleButton(button);
                filterAllMessages();
            });

            header.appendChild(button);
        }
    };

    // Fungsi untuk memperbarui tampilan tombol toggle
    const updateToggleButton = (button) => {
        button.textContent = isActive ? "🔇 JUDOL : AKTIF" : "🔇 JUDOL : NONAKTIF";
        button.style.backgroundColor = isActive ? "#4CAF50" : "#f44336";
        button.style.cssText += `
            position: absolute;
            top: 5px;
            right: 95px;
            z-index: 1000;
            color: white;
            border: none;
            padding: 10px;
            cursor: pointer;
            border-radius: 8px;
            font-weight: bold;
        `;
    };

    // Inisialisasi script
    const init = () => {
        // Menambahkan CSS untuk menyembunyikan pesan yang difilter
        const style = document.createElement("style");
        style.textContent = `
            ${elName.yt.messageTag}.${elName.ytlcb.filteredItemClass} {
                display: none !important;
            }
        `;
        document.head.appendChild(style);

        // Mengawasi perubahan pada elemen chat
        const chatListNode = document.querySelector("#chat");
        if (chatListNode) {
            filterAllMessages();
            const chatObserver = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    const chatNodes = [...mutation.addedNodes].filter(node =>
                        node.nodeType === Node.ELEMENT_NODE && node.classList.contains(elName.yt.messageClass)
                    );
                    filterMessages(chatNodes);
                });
            });
            chatObserver.observe(chatListNode, { childList: true, subtree: true });
        }

        // Menambahkan tombol toggle filter
        addToggleButton();
    };

    // Memulai script setelah halaman selesai dimuat
    window.addEventListener('load', init);
})();
