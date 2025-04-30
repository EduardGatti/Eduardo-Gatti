import express from "express";

const app = express();

let alunos = [];

app.use(express.json());

app.post('/alunos', (req, res) => {
    const { nome, matricula, status } = req.body;
    const matriculaStr = String(matricula);

    if (!nome || nome.length == "") {
        return res.status(400).json({ erro: "O campo 'nome' é obrigatório." })
    }

    if (!matricula || matricula.length == "") {
        return res.status(400).json({ erro: "O campo 'matricula' é obrigatório." })
    }

    if (!status || status == "") {
        return res.status(400).json({ erro: "O campo 'status' é obrigatório." })
    }

    if (status !== "ativo" && status !== "inativo") {
        return res.status(400).json({ erro: "O campo 'status' deve ser 'ativo' ou 'inativo'." })
    }

    if (nome.length < 3) {
        return res.status(400).json({ erro: "O nome deve conter pelo menos 3 caracteres." })
    }

    if (alunos.some(aluno => aluno.matricula === matriculaStr)) {
        return res.status(409).json({
            erro: "Já existe um aluno com essa matrícula.",

        });
    }

    const novoAluno = {
        nome,
        matricula: matriculaStr,
        status,
        dataCriacao: new Date().toISOString()
    };

    alunos.push(novoAluno);

    res.status(201).json({
        mensagem: "Aluno cadastrado com sucesso.",
        aluno: novoAluno
    });
});

app.delete('/alunos/:matricula', (req, res) => {
    const matricula = String(req.params.matricula);

    const index = alunos.findIndex(aluno => aluno.matricula === matricula);

    if (index === -1) {
        return res.status(404).json({ erro: "Aluno não encontrado!" });
    } else {
        alunos.splice(index, 1);
        return res.status(200).json({
            mensagem: "Aluno removido com sucesso.",
            matricula: matricula
        });
    }
});

app.post('/alunos/:matricula/notas', (req, res) => {
    const matricula = String(req.params.matricula);
    const { notas } = req.body;

    const aluno = alunos.find(aluno => aluno.matricula === matricula);

    if (!aluno) {
        return res.status(404).json({ erro: "Aluno não encontrado." });
    }

    if (aluno.status === "inativo") {
        return res.status(400).json({ erro: "Não é possível registrar notas para alunos inativos." });
    }

    if (!notas || !Array.isArray(notas)) {
        return res.status(400).json({ erro: "O campo 'notas' é obrigatório e deve ser um array de 4 números." });
    }

    if (notas.length !== 4) {
        return res.status(400).json({ erro: "Devem ser fornecidas exatamente 4 notas." });
    }

    if (notas.some(nota => typeof nota !== 'number' || nota < 0 || nota > 10)) {
        return res.status(400).json({ erro: "As notas devem ser números entre 0 e 10." });
    }

    aluno.notas = notas;

    const media = notas.reduce((acc, nota) => acc + nota, 0) / notas.length;
    aluno.media = parseFloat(media.toFixed(2));

    if (media >= 7) {
        aluno.situacao = "aprovado";
    } else if (media >= 5) {
        aluno.situacao = "recuperacao";
    } else {
        aluno.situacao = "reprovado";
    }

    aluno.dataAtualizacaoNotas = new Date().toISOString();

    res.json({
        mensagem: "Notas cadastradas com sucesso.",
        aluno
    });
});

app.get('/alunos', (req, res) => {
    const { status } = req.query;

    let resultado = alunos;

    if (status === "ativo" || status === "inativo") {
        resultado = alunos.filter(aluno => aluno.status === status);
    }

    const resposta = resultado.map(aluno => ({
        nome: aluno.nome,
        matricula: aluno.matricula,
        status: aluno.status,
        dataCriacao: aluno.dataCriacao
    }));

    res.json(resposta);
});
app.get('/alunos/notas', (req, res) => {
    const alunosAtivos = alunos
        .filter(aluno => aluno.status == "ativo")
        .map(aluno => ({
            nome: aluno.nome,
            matricula: aluno.matricula,
            notas: aluno.notas,
            media: aluno.media,
            situacao: aluno.situacao
        }));

    res.json(alunosAtivos);
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
