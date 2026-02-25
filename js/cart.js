/* =========================================
   CARRINHO ARAÚJO - VERSÃO FINAL ATUALIZADA
   ========================================= */

const Cart = {
    items: [],
    taxaEntrega: 0,
    bairrosData: [], 
    bairroConfirmado: false,
    enviadoAoWhats: false,

    getSaudacao: function() {
        const hora = new Date().getHours();
        if (hora >= 5 && hora < 12) return "Bom dia";
        if (hora >= 12 && hora < 18) return "Boa tarde";
        return "Boa noite";
    },

    add: function(product) {
        const precoNum = parseFloat(String(product.preco || product.preço || 0).replace(',', '.'));
        const existingItem = this.items.find(item => item.nome === product.nome);
        
        if (existingItem) {
            existingItem.quantidade += 1;
        } else {
            this.items.push({
                nome: product.nome,
                preco: precoNum,
                quantidade: 1
            });
        }
        this.update();
        this.playAnimation();
    },

    changeQuantity: function(index, delta) {
        this.items[index].quantidade += delta;
        if (this.items[index].quantidade <= 0) {
            this.items.splice(index, 1);
        }
        this.update();
    },

    playAnimation: function() {
        const btn = document.querySelector(".cart-float");
        if (btn) {
            btn.classList.add("cart-bump");
            setTimeout(() => btn.classList.remove("cart-bump"), 300);
        }
    },

    update: function() {
        if (this.bairrosData.length === 0 && window.storeConfig && window.storeConfig.bairros) {
            this.bairrosData = window.storeConfig.bairros;
        }

        const subtotal = this.items.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
        const totalComTaxa = subtotal + this.taxaEntrega;
        const qtdTotal = this.items.reduce((sum, item) => sum + item.quantidade, 0);

        const totalFloat = document.getElementById("cart-total-float");
        const totalModal = document.getElementById("cart-total");
        const cartCount = document.getElementById("cart-count");
        
        if (totalFloat) totalFloat.innerText = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
        if (totalModal) totalModal.innerHTML = `<strong>R$ ${totalComTaxa.toFixed(2).replace('.', ',')}</strong>`;
        if (cartCount) cartCount.innerText = qtdTotal;

        const floatBtn = document.querySelector(".cart-float");
        if (floatBtn) {
            if (qtdTotal > 0) floatBtn.classList.remove("hidden");
            else floatBtn.classList.add("hidden");
        }

        this.render();
    },

    render: function() {
        const container = document.getElementById("cart-items");
        const minOrderContainer = document.getElementById("min-order-info");
        if (!container) return;

        if (this.items.length === 0) {
            container.innerHTML = "<p style='text-align:center;padding:20px;'>Carrinho vazio.</p>";
            if (minOrderContainer) minOrderContainer.innerHTML = "";
            return;
        }

        container.innerHTML = this.items.map((item, index) => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #eee;">
                <div style="display:flex;flex-direction:column;">
                    <span style="font-weight:bold;">${item.nome}</span>
                    <span style="font-size:0.85rem;color:#666;">R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}</span>
                </div>
                <div style="display:flex;align-items:center;gap:12px;">
                    <button onclick="Cart.changeQuantity(${index}, -1)" style="width:30px;height:30px;border-radius:50%;border:none;background:#f0f0f0;cursor:pointer;">-</button>
                    <span style="font-weight:bold;">${item.quantidade}</span>
                    <button onclick="Cart.changeQuantity(${index}, 1)" style="width:30px;height:30px;border-radius:50%;border:none;background:#25d366;color:white;cursor:pointer;">+</button>
                </div>
            </div>
        `).join('');

        const subtotal = this.items.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
        if (minOrderContainer) {
            if (subtotal < 15.00) {
                const falta = (15.00 - subtotal).toFixed(2).replace('.', ',');
                minOrderContainer.innerHTML = `
                    <div class="min-order-warning" style="background:#fff3e0; color:#e65100; padding:10px; border-radius:8px; margin-bottom:15px; font-size:0.9rem; border:1px solid #ffe0b2; text-align:center;">
                        🛵 <strong>Pedido Mínimo: R$ 15,00</strong><br>
                        Faltam R$ ${falta} para completarmos sua entrega!
                    </div>`;
            } else {
                minOrderContainer.innerHTML = "";
            }
        }
    },

    ajustarPagamento: function(valor) {
        const areaPix = document.getElementById("area-pix");
        const areaTroco = document.getElementById("area-troco");
        const config = window.storeConfig || {};
        
        if (valor === 'Pix') {
            if (areaPix) {
                areaPix.classList.remove("hidden");
                areaPix.style.display = "block"; 
                document.getElementById("chave-pix-valor").innerText = config.chave_pix || "Chave não cadastrada";
                document.getElementById("favorecido-pix").innerText = config.favorecido || "Araújo Assados";
            }
            if (areaTroco) {
                areaTroco.classList.add("hidden");
                areaTroco.style.display = "none";
            }
        } 
        else if (valor === 'Dinheiro') {
            if (areaTroco) {
                areaTroco.classList.remove("hidden");
                areaTroco.style.display = "block";
            }
            if (areaPix) {
                areaPix.classList.add("hidden");
                areaPix.style.display = "none";
            }
        }
        else {
            if (areaPix) { areaPix.classList.add("hidden"); areaPix.style.display = "none"; }
            if (areaTroco) { areaTroco.classList.add("hidden"); areaTroco.style.display = "none"; }
        }
    },

    enviarPedido: function() {
        if (!this.bairroConfirmado) return alert("⚠️ Selecione o bairro!");
        const subtotal = this.items.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
        
        if (subtotal < 15.00) return alert("😊 O pedido mínimo é R$ 15,00.");

        const config = window.storeConfig || {};
        
        let foneLoja = config.whatsapp ? String(config.whatsapp).replace(/\D/g, '') : "5591992875156";
        if (foneLoja.length === 11) foneLoja = "55" + foneLoja;

        const nome = document.getElementById("cliente-nome").value;
        const endereco = document.getElementById("cliente-endereco").value;
        const bairro = document.getElementById("cliente-bairro").value;
        const pagamento = document.getElementById("pagamento").value;
        const obs = document.getElementById("cliente-obs").value;
        const troco = document.getElementById("valor-troco") ? document.getElementById("valor-troco").value : "";

        if (!nome || !endereco) return alert("Por favor, preencha nome e endereço.");

        // CONFIGURAÇÃO DO LINK DO MAPA (MARCAÇÃO EXATA)
        const enderecoBusca = `${endereco}, ${bairro}, Castanhal, PA`;
        const linkGoogleMaps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoBusca)}`;

        // Listagem de itens com valores individuais
        let itensTexto = this.items.map(i => {
            const totalItem = (i.preco * i.quantidade).toFixed(2).replace('.', ',');
            return `• ${i.quantidade}x ${i.nome} .... R$ ${totalItem}`;
        }).join('\n');

        const taxaTexto = this.taxaEntrega.toFixed(2).replace('.', ',');
        const totalGeral = (subtotal + this.taxaEntrega).toFixed(2).replace('.', ',');

        // Estrutura da Mensagem Limpa
        let msg = `🛒 *NOVO PEDIDO - ${config.nome_loja || 'Lufekelo Delivery 10'}*
-----------------------------------------
👤 *CLIENTE:* ${nome}
📍 *ENDEREÇO:* ${endereco} - ${bairro}

*ITENS DO PEDIDO:*
${itensTexto}

-----------------------------------------
🛵 *ENTREGA:* R$ ${taxaTexto}
💰 *TOTAL A PAGAR: R$ ${totalGeral}*
💳 *FORMA:* ${pagamento}${pagamento === 'Dinheiro' && troco ? ' (Troco p/ ' + troco + ')' : ''}
${obs ? '\n💬 *OBS:* ' + obs : ''}

-----------------------------------------
🚚 *DADOS PARA O MOTOBOY (COPIAR):*

*CLIENTE:* ${nome}
*DESTINO:* ${endereco} - ${bairro}
*MAPS:* ${linkGoogleMaps}
*VALOR TOTAL:* R$ ${totalGeral} (${pagamento})
*TAXA MOTO:* R$ ${taxaTexto}`;

        window.open(`https://api.whatsapp.com/send?phone=${foneLoja}&text=${encodeURIComponent(msg)}`, "_blank");
        
        this.enviadoAoWhats = true;

        if (pagamento === 'Pix') {
            this.abrirModalCopiaPix();
        } else {
            alert("✨ Pedido enviado com sucesso!");
            setTimeout(() => { location.reload(); }, 1500);
        }
    },

    abrirModalCopiaPix: function() {
        const config = window.storeConfig || {};
        const modal = document.getElementById("modal-pix-lembrete");
        if (modal) {
            modal.style.display = "flex";
            modal.querySelector("h2").innerText = "Pedido Enviado! 🏁";
            modal.querySelector("p").innerHTML = 
                `Sua chave Pix: <strong>${config.chave_pix}</strong><br><br>` +
                `1. **Copie a chave** abaixo.<br>` +
                `2. Pague no banco e **envie o comprovante** no WhatsApp!`;
            
            const btn = modal.querySelector("button");
            btn.innerText = "📋 COPIAR CHAVE PIX";
            btn.onclick = () => {
                this.copiarPix();
                btn.innerText = "✅ COPIADO!";
                btn.style.background = "#25d366";
                setTimeout(() => {
                    alert("Chave copiada! Envie o comprovante no WhatsApp.");
                    location.reload();
                }, 1500);
            };
        }
    },

    copiarPix: function() {
        const config = window.storeConfig || {};
        if (config.chave_pix) {
            navigator.clipboard.writeText(config.chave_pix);
        }
    },

    sugerirBairros: function(valor) {
        const statusBairro = document.getElementById("taxa-status");
        if (!statusBairro || !valor) return;
        const normalizar = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
        const valorLimpo = normalizar(valor);
        const bairroEncontrado = this.bairrosData.find(b => b && b.nome && normalizar(b.nome) === valorLimpo);
        if (bairroEncontrado) {
            this.taxaEntrega = parseFloat(bairroEncontrado.taxa);
            this.bairroConfirmado = true;
            statusBairro.innerHTML = `<span style="color: #25d366;">✅ Taxa: R$ ${this.taxaEntrega.toFixed(2).replace('.', ',')}</span>`;
        } else {
            this.taxaEntrega = 0;
            this.bairroConfirmado = false;
            statusBairro.innerHTML = `<span style="color: #d9534f;">❌ Bairro não localizado.</span>`;
        }
        this.update();
    },

    checkout: function() {
        const subtotal = this.items.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
        if (subtotal < 15.00) return alert("😊 O pedido mínimo é R$ 15,00.");
        document.getElementById("cart-modal").classList.add("hidden");
        document.getElementById("checkout-modal").classList.remove("hidden");
        this.ajustarPagamento(document.getElementById("pagamento").value);
    },

    toggle: function() {
        const modal = document.getElementById("cart-modal");
        if (modal) { modal.classList.toggle("hidden"); this.render(); }
    },

    closeCheckout: function() {
        document.getElementById("checkout-modal").classList.add("hidden");
    }
};

window.Cart = Cart;
