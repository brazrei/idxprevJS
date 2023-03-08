
class Metar {
    parametroTeto = { vermelho: 200, ambar: 500, amarelo: 1500, verde: 5000 }
    parametoVisibilidade = { vermelho: 1000, ambar: 2500, amarelo: 5000, verde: 10000 }
    parametroTurno = { manha: 8, tarde: 15, noite: 21 }

    get(callBack, localidade, data) {
        let dataIni = data, dataFim = data
        let resp = []

        const chaveAPI = 'U9Q2PoK6e5uhykrMXrsrGAQssG8htAnPIqXsxmei'

        fetch(`https://api-redemet.decea.mil.br/mensagens/metar/${localidade}?api_key=${chaveAPI}&data_ini=${dataIni}00&data_fim=${dataFim}23`)
            .then((response) => {
                if (response.ok)
                    return response.json()
                //setMetares(response.data)
            })
            .then(response => {

                //console.log(this.getTeto(response.data.data[6].mens));
                response.data.data.map((mens) => (
                    // let teto = this.getTeto(mens.mens)[2]]];

                    resp = resp.concat([[mens.mens, this.getVisibilidade(mens.mens), this.getTeto(mens.mens)[2], this.getColorMetar(this.getVisibilidade(mens.mens), this.getTeto(mens.mens)[2]), this.getTurnoMetar(mens.validade_inicial)]])
                    //console.log(mens.mens)    

                )
                )
                callBack(resp)


            })
        //return resp.slice(0)
    }

    getTurnoMetar(inicioValidade) {
        let inicio = new Date(inicioValidade).getHours()
        if (inicio >= this.parametroTurno.noite)
            return "NOITE"
        else if (inicio >= this.parametroTurno.tarde)
            return "TARDE"
        else if (inicio >= this.parametroTurno.manha)
            return "MANHÃ"
        return ""
    }

    getColorMetar(vis, teto) {
        teto = parseInt(teto)
        //if (teto === 0)
        //    teto = 1500
        if (vis < this.parametoVisibilidade.vermelho || teto < this.parametroTeto.vermelho)
            return "VERMELHO"
        if (vis < this.parametoVisibilidade.ambar || teto < this.parametroTeto.ambar)
            return "AMBAR"
        if (vis < this.parametoVisibilidade.amarelo || teto < this.parametroTeto.amarelo)
            return "AMARELO"
        if (vis < this.parametoVisibilidade.verde || teto < this.parametroTeto.verde)
            return "VERDE"

        return "AZUL"
    }

    getTeto(metar) {
        var resultado = [3];

        let ibkn = metar.indexOf(" BKN0");;
        let iovc = metar.indexOf(" OVC0");;
        let ivv = metar.indexOf(" VV00");;

        var bkn0 = ibkn > -1;
        var bknbbb = metar.includes(" BKN///");
        var bkn = bkn0 || bknbbb;

        var ovc0 = iovc > -1;
        var ovcbbb = metar.includes(" OVC///");
        var ovc = ovc0 || ovcbbb;

        var vv00 = ivv > -1;
        var vvbbb = metar.includes(" VV///");
        var vv = vv00 || vvbbb;

        resultado[1] = "F";
        resultado[2] = "99999";
        resultado[3] = "NIL";



        var inicio = 0;
        var valorTeto = 0;

        if (bkn0) {
            inicio = metar.indexOf(" BKN0") + 5;
            valorTeto = metar.substr(inicio, 2);
            resultado[2] = valorTeto * 100;
            resultado[3] = "BKN" + valorTeto.padStart(3, "0");
        }

        if (ovc0) {
            if ((iovc < ibkn) || (ibkn === -1)) {
                inicio = metar.indexOf(" OVC0") + 5;
                valorTeto = metar.substr(inicio, 2);
                resultado[2] = valorTeto * 100;
                resultado[3] = "OVC" + valorTeto.padStart(3, "0");
            }
        }

        if (vv00) {
            inicio = metar.indexOf(" VV00") + 5;
            valorTeto = metar.substr(inicio, 1);
            resultado[2] = valorTeto * 100;
            resultado[3] = "VV00" + valorTeto;
        }

        if (bknbbb)
            resultado[3] = "BKN///";
        if (ovcbbb)
            resultado[3] = "OVC///";
        if (vvbbb)
            resultado[3] = "VV///";


        if (bkn || ovc || vv) {
            resultado[1] = "T";
        }

        return resultado;
    }

    getposVis(metar) {
        var posVis = 4;

        if (metar.includes(" COR ")) {
            posVis = posVis + 1;
        }

        if (metar.includes(" AUTO ")) {
            posVis = posVis + 1;
        }

        return posVis;
    }

    arraySize(arr) {
        return arr.length
    }

    getVisibilidade(metar) {

        var campos = [];
        var posVis;
        let visib
        if (metar.includes(" CAVOK ") || metar.includes(" 9999 ")) {
            return 10000
        }

        posVis = this.getposVis(metar);

        campos = metar.split(" ");

        if (posVis < this.arraySize(campos)) {
            visib = campos[posVis] + "";
        }
        else {
            return -1;
        }

        if (visib.length > 4) {
            if (visib.indexOf("V") > -1) { //vento variando
                posVis = posVis + 1;
                visib = campos[posVis];
                return visib;
            }
            else {
                return -1
            }
        }
        else {
            return visib
        }

    }

    getColorTeto(teto, parametro) {

    }

    getColorVisibilidade(visibilidade, parametro) {

    }

    getLocalidade(metar) {
        var campos = [];

        var idxLoc = 1;
        if (metar.indexOf(" COR ") > 0) {
            idxLoc = idxLoc + 1;
        }

        campos = metar.split(" ");

        return campos[idxLoc];
    }

    /*getColorMetar(metar, parametroTeto, parametroVisibilidade) {
    }*/
}

var heading = ["Mensagem", "Visibilidade", "    Teto    ", "Cor"];
//var manha = [5, 14] // hora inicial e final
//var tarde = [15, 20]
//var noite = [21, 23]


//const [data, setData] = useState("")
//const [localidade, setLocalidade] = useState("SBCF")
//const [metares, setMetares] = useState(body)

//var color = ""

function setMetares(metares) {
    function getRows(row) {
        let r = ''
        row.map((val, j) => (
            r += `<td>${val}</td>`
        ))
        return r

    }

    //Exporta para a tabela de metares
    let lines = ""
    metares.map((row, i) => (
        lines += `<tr class="${getColor(row[3])}"><td></td>` + getRows(row) + '</tr>'
    ))
    document.getElementById('tableRowsMetar').innerHTML = lines

    //Exporta para a tabela de turnos
    arrayTurnos = []
    metares.map((row, i) => (
        updateArrayTurnos((new Metar()).getLocalidade(row[0]), row[3], row[4])
    ))

    lines = ""
    Object.keys(arrayTurnos).map((row, i) => (
        lines += `<tr><td>${row}</td><td class="${getColor(arrayTurnos[row]["MANHÃ"])}">${arrayTurnos[row]["MANHÃ"]}</td><td class="${getColor(arrayTurnos[row]["TARDE"])}">${arrayTurnos[row]["TARDE"]}</td><td class="${getColor(arrayTurnos[row]["NOITE"])}">${arrayTurnos[row]["NOITE"]}</td> </tr>`
    ))
    document.getElementById('tableRowsTurnos').innerHTML = lines

}

function updateArrayTurnos(localidade, status, turno) {
    arrayStatus = ["NIL","AZUL", "VERDE", "AMARELO", "AMBAR", "VERMELHO"]
    if (!arrayTurnos[localidade]) { 
        arrayTurnos[localidade] = []
        arrayTurnos[localidade]["MANHÃ"] = "NIL"
        arrayTurnos[localidade]["TARDE"] = "NIL"
        arrayTurnos[localidade]["NOITE"] = "NIL"
    }

    if ((arrayStatus.indexOf(status) > arrayStatus.indexOf(arrayTurnos[localidade][turno])))
        arrayTurnos[localidade][turno] = status
}

function getMetar(localidade, data) {
    function done(mets) {
        setMetares(mets)
    }
    //const met = new Metar()
    (new Metar()).get(done, localidade, data) //a solicitação de Metar via fetch é assíncrona
}

function getColor(c) {
    return c?.toLowerCase()
}

function updateTable(dados) {
    console.log(dados)

}

function submitF() {
    //let metar = new Metar()
    let data = document.getElementById('idData').value.replaceAll('-', '')
    getMetar(document.getElementById('idLocalidade').value, data)
}