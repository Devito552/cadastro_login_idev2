// Função para buscar endereço pelo CEP
async function buscarEnderecoPorCEP(cep) {
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        if (!response.ok) {
            throw new Error('CEP inválido ou não encontrado.');
        }
        const endereco = await response.json();
        document.getElementById('rua').value = endereco.logradouro;
        document.getElementById('estado').value = endereco.uf;
        document.getElementById('cidade').value = endereco.localidade;
        document.getElementById('bairro').value = endereco.bairro;

    } catch (error) {
        document.getElementById('resultados').innerHTML = `<p>${error.message}</p>`;
    }
}

// Função para enviar a solicitação de cadastro
async function cadastrarUsuario() {
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;
    const cep = document.getElementById('cep').value;
    const bairro = document.getElementById('bairro').value;
    const rua = document.getElementById('rua').value;
    const cidade = document.getElementById('cidade').value;
    const estado = document.getElementById('estado').value;
    const numero = document.getElementById('numero').value;

    try {

        if (senha !== confirmarSenha) {
            document.getElementById('resultados').innerHTML = `<p>As senhas não coincidem.</p>`;
            return;
        }

        const response = await fetch('/cadastro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({ nome, email, senha, cep, estado, cidade, rua, numero, bairro })
        });


        const data = await response.json();
        if (response.ok) {
            document.getElementById('resultados').innerHTML = `<p>${data.message}</p>`;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        document.getElementById('resultados').innerHTML = `<p>${error.message}</p>`;
    }
}

async function Logar() {
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {

        const responseLogin = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({ email, senha })
        });


        const dataLogin = await responseLogin.json();
        if (responseLogin.ok) {
            document.getElementById('resultadosLogin').innerHTML = `<p>${dataLogin.message}</p>`;
        } else {
            throw new Error(dataLogin.message);
        }
    } catch (error) {
        document.getElementById('resultadosLogin').innerHTML = `<p>${error.message}</p>`;
    }
}



document.getElementById('cep').addEventListener('change', async function (event) {
    const cep = event.target.value;
    await buscarEnderecoPorCEP(cep);
});


document.getElementById('formCadastro').addEventListener('submit', async function (event) {
    event.preventDefault();
    await cadastrarUsuario();
});

document.getElementById('formLogin').addEventListener('submit', async function (event) {
    event.preventDefault();
    await Logar();
});

