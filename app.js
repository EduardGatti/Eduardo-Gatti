import express from "express";

const app = express()

let alunos = []


app.use(express.json());

app.post('/alunos', (req, res) => {
    const { nome, matricula, status } = req.body;

    if (!nome || !matricula || !status) {
        return res.status(400).json({
            erro: "Campos obrigatórios faltando: nome, matricula, status.",
            campos: {
                nome: !nome,
                matricula: !matricula,
                status: !status
            }
        });
    }

    if (alunos.filter(aluno => aluno.matricula === matricula)) {
        return res.status(409).json({
            erro: "Matrícula já cadastrada.",
            matriculaExistente: matricula
        });
    }

    const novoAluno = {
        nome,
        matricula,
        status,
        notas: []
    };

    alunos.push(novoAluno);

    res.status(201).json({
        mensagem: "Aluno cadastrado com sucesso!",
        aluno: novoAluno
    });
});

app.get('/alunos', (req, res) => {
    res.json(alunos)
})

app.post('/alunos/:matricula/notas', (req, res) => {
    const { matricula } = req.params;
    const { notas } = req.body;
    const aluno = alunos.find(aluno => aluno.matricula === matricula);

    if (!aluno) {
        return res.status(404).json({ erro: "Aluno não encontrado." });
    }

    if (!notas || notas.length !== 4) {
        return res.status(400).json({ erro: "São necessárias exatamente 4 notas." });
    }

    aluno.notas = notas;

    res.json({
        mensagem: "Notas atualizadas com sucesso!",
        aluno: aluno
    });
});

// app.delete('/alunos/:matricula', (req, res) => {

// })

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000')
})