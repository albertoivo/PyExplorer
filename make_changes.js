import fs from 'fs';
import path from 'path';

function fixFile(file, replacements) {
    const p = path.join('src/data/questions', file);
    let content = fs.readFileSync(p, 'utf8');
    let changed = false;
    for (const {search, replace} of replacements) {
        if (content.includes(search)) {
            content = content.replace(search, replace);
            changed = true;
        } else {
            console.log(`Warning: could not find \n${search}\nin ${file}`);
        }
    }
    if (changed) {
        fs.writeFileSync(p, content);
        console.log(`Updated ${file}`);
    }
}

fixFile('variables.ts', [
    {
        search: `solutionTemplate: 'idade = 10\\n"Tenho " + str(idade) + " anos"\\nprint(mensagem)',`,
        replace: `solutionTemplate: 'idade = 10\\nmensagem = "Tenho " + str(idade) + " anos"\\nprint(mensagem)',`
    },
    {
        search: `solutionTemplate: 'a = "15"\\nb = "7"\\nint(a) + int(b)\\nprint(resultado)',`,
        replace: `solutionTemplate: 'a = "15"\\nb = "7"\\nresultado = int(a) + int(b)\\nprint(resultado)',`
    },
    { search: "Se você tentar colocar palavras em uma variável e tentar somar com um número", replace: "Se você tentar guardar palavras em uma variável e somar com um número" }

]);

fixFile('numbers.ts', [
    {
        search: `solutionTemplate: '(20 + 10) / 2\\nprint(int(resultado))',`,
        replace: `solutionTemplate: 'resultado = (20 + 10) / 2\\nprint(int(resultado))',`
    }
]);

fixFile('strings.ts', [
    {
        search: `solutionTemplate: 'texto = "maçã,banana,uva"\\ntexto.split(",")\\nprint(frutas)',`,
        replace: `solutionTemplate: 'texto = "maçã,banana,uva"\\nfrutas = texto.split(",")\\nprint(frutas)',`
    },
    {
        search: `solutionTemplate: 'palavras = ["Eu", "amo", "Python"]\\n" ".join(palavras)\\nprint(frase)',`,
        replace: `solutionTemplate: 'palavras = ["Eu", "amo", "Python"]\\nfrase = " ".join(palavras)\\nprint(frase)',`
    }
]);

fixFile('lists.ts', [
    {
        search: `solutionTemplate: 'numeros = [10, 20, 30, 40, 50]\\nnumeros = numeros[0:2]\\nprint(primeiros)',`,
        replace: `solutionTemplate: 'numeros = [10, 20, 30, 40, 50]\\nprimeiros = numeros[0:2]\\nprint(primeiros)',`
    }
]);

fixFile('error_handling.ts', [
    {
        search: `solutionTemplate: 'try:\\n  x = int(input()) / int(input())\\nexcept ValueError:\\n  print("Erro de valor")\\n___ ZeroDivisionError:\\n  print("Não divida por zero")',`,
        replace: `solutionTemplate: 'try:\\n  x = int(input("N1:")) / int(input("N2:"))\\nexcept ValueError:\\n  print("Erro de valor")\\nexcept ZeroDivisionError:\\n  print("Não divida por zero")',`
    },
    {
        search: `solutionTemplate: 'try:\\n    resultado = 10 / 0',`,
        replace: `solutionTemplate: 'try:\\n    resultado = 10 / 0\\nexcept:\\n    print("Ops! Não pode dividir por zero!")',`
    },
    {
        search: `solutionTemplate: 'except:\\n    print("Isso não é um número!")',`,
        replace: `solutionTemplate: 'try:\\n    numero = int(input("Digite um número: "))\\n    print("Você digitou:", numero)\\nexcept:\\n    print("Isso não é um número!")',`
    },
    {
        search: `{ input: null, expectedOutput: 'Digite um número:' }`,
        replace: `{ input: ['gato'], expectedOutput: 'Digite um número: Isso não é um número!' }`
    },
    {
        search: `solutionTemplate: 'try:',`,
        replace: `solutionTemplate: 'lista = [1, 2, 3]\\ntry:\\n    print(lista[10])\\nexcept IndexError:\\n    print("Lista muito curta!")',`
    },
    {
        search: `solutionTemplate: 'except ZeroDivisionError:',`,
        replace: `solutionTemplate: 'try:\\n  x = int(input("N1:")) / int(input("N2:"))\\nexcept ValueError:\\n  print("Erro de valor")\\nexcept ZeroDivisionError:\\n  print("Não divida por zero")',`
    },
    {
        search: `{ input: null, expectedOutput: '' } // Teste complexo`,
        replace: `{ input: ['10', '0'], expectedOutput: 'N1:N2:Não divida por zero' }`
    },
    {
        search: `solutionTemplate: 'except ValueError:',`,
        replace: `solutionTemplate: 'try:\\n  n = int("dez")\\nexcept ValueError:\\n  print("Não é número")',`
    },
    {
        search: `solutionTemplate: 'pass',`,
        replace: `solutionTemplate: 'try:\\n  print(1/0)\\nexcept:\\n  pass',`
    },
    {
        search: `O except só trabalha se houver problemas! Se tudo der certo no try, o Python pula o except. Folga merecida! 🏖️`,
        replace: `O \`except\` só trabalha se houver problemas! Se tudo der certo no \`try\`, o Python pula o \`except\`. Folga merecida! 🏖️`
    }
]);

fixFile('files.ts', [
    {
        search: `solutionTemplate: 'w',`,
        replace: `solutionTemplate: 'with open("diario.txt", "w") as arquivo:\\n    arquivo.write("Olá diário!")',`
    }
]);

fixFile('modules.ts', [
    {
        search: `solutionTemplate: 'import',`,
        replace: `solutionTemplate: 'import random\\n\\nnumero = random.randint(1, 6)\\nprint(numero)',`
    }
]);

fixFile('pythonic.ts', [
    {
        search: `solutionTemplate: 'for',`,
        replace: `solutionTemplate: 'dobros = [x * 2 for x in [1, 2, 3]]\\nprint(dobros)',`
    }
]);

fixFile('turtle_art.ts', [
    {
        search: `solutionTemplate: 'forward',`,
        replace: `solutionTemplate: 'import turtle\\nt = turtle.Turtle()\\nt.forward(100)',`
    }
]);

fixFile('data_science.ts', [
    {
        search: `solutionTemplate: 'len',`,
        replace: `solutionTemplate: 'pontos = [10, 20, 30]\\nmedia = sum(pontos) / len(pontos)\\nprint(media)',`
    }
]);

fixFile('web_api.ts', [
    {
        search: `solutionTemplate: 'status',`,
        replace: `solutionTemplate: 'resposta_api = {"status": "sucesso", "codigo": 200}\\nprint(resposta_api["status"])',`
    }
]);

fixFile('user_input.ts', [
    {
        search: `solutionTemplate: 'nome = input("Qual é o seu nome? ")\\nprint("Olá, " + nome)',`,
        replace: `solutionTemplate: 'nome = input("Qual é o seu nome? ")\\nprint("Olá, " + nome)',`
    },
    {
        search: `{ input: null, expectedOutput: 'Qual é o seu nome?' }`,
        replace: `{ input: ['Maria'], expectedOutput: 'Qual é o seu nome? Olá, Maria' }`
    },
    {
        search: `{ input: null, expectedOutput: 'Quantos anos você tem?' }`,
        replace: `{ input: ['10'], expectedOutput: 'Quantos anos você tem? Em 5 anos você terá 15' }`
    },
    {
        search: `{ input: null, expectedOutput: 'Sua altura em metros (use ponto):' }`,
        replace: `{ input: ['1.5'], expectedOutput: 'Sua altura em metros (use ponto): Você tem 1.5 metros' }`
    },
    {
        search: `{ input: null, expectedOutput: 'Digite um número:' }`,
        replace: `{ input: ['10'], expectedOutput: 'Digite um número: 20' }`
    },
    {
        search: `{ input: null, expectedOutput: 'Qual sua cor favorita?' }`,
        replace: `{ input: ['Azul'], expectedOutput: 'Qual sua cor favorita? Que cor linda!' }`
    },
    {
        search: `{ input: null, expectedOutput: 'Idade:' }`,
        replace: `{ input: ['12'], expectedOutput: 'Idade: 2013' }`
    },
    {
        search: `{ input: null, expectedOutput: 'Nome:' }`,
        replace: `{ input: ['Lucas'], expectedOutput: 'Nome: Oi, Lucas!' }`
    },
    {
        search: `{ input: null, expectedOutput: 'Nome:' }`, // Actually second occurence
        replace: `{ input: ['Lucas'], expectedOutput: 'Nome: Oi, Lucas!' }`
    },
    {
        search: `{ input: null, expectedOutput: 'N1:' }`,
        replace: `{ input: ['5', '10'], expectedOutput: 'N1: N2: 50' }`
    }
]);

fixFile('oop_basics.ts', [
    {
        search: `solutionTemplate: 'self',`,
        replace: `solutionTemplate: 'class Heroi:\\n    def __init__(self, nome):\\n        self.nome = nome',`
    },
    {
        search: `expectedOutput: null,\n                description: 'Define self corretamente'`,
        replace: `expectedOutput: '',\n                description: 'Define self corretamente'`
    }
]);
