
class Metar {
    parametroTeto = { vermelho: 200, ambar: 500, amarelo: 1500, verde: 5000 }
    parametoVisibilidade = { vermelho: 1000, ambar: 2500, amarelo: 5000, verde: 10000 }
    parametroTurno = { manha: 8, tarde: 15, noite: 21, noiteFim: 23 }

    constructor(manha, tarde, noite, noiteFim) {
        if (manha)
            this.setParametroTurno(manha, tarde, noite, noiteFim)
    }

    get(callBack, localidade, datai, dataf) {

        async function getPages(url, lastPage, callBack, arg, obj) {

            for (let i = 2; i <= lastPage; i++) {
                const response = await fetch(url + i);
                let { data, total_pages } = await response.json();
                data.data.forEach(mens => arg = arg.concat([[mens.mens, obj.getVisibilidade(mens.mens), obj.getTeto(mens.mens)[2], obj.getColorMetar(obj.getVisibilidade(mens.mens), obj.getTeto(mens.mens)[2]), obj.getTurnoMetar(mens.validade_inicial, dataIni.substr(6, 2))]]))
            }
            callBack(arg)
        }

        function getUrlPages(url) {//'/?page_tam=150&data_ini=2023030900&data_fim=2023031005&page=2'
            return url.split("page=")[0] + "page="

        }
        let dataIni = datai, dataFim = dataf
        let resp = []

        const chaveAPI = 'U9Q2PoK6e5uhykrMXrsrGAQssG8htAnPIqXsxmei'
        if (dataFim.length < 10)
            dataFim += "23"
        let urlBase = `https://api-redemet.decea.mil.br/mensagens/metar/${localidade}?api_key=${chaveAPI}&data_ini=${dataIni}00&data_fim=${dataFim}`
        fetch(urlBase)
            .then((response) => {
                if (response.ok)
                    return response.json()
                //setMetares(response.data)
            })
            .then(response => {
                //response.data.next_page_url = ""
                response.data.data.map((mens) => (

                    resp = resp.concat([[mens.mens, this.getVisibilidade(mens.mens), this.getTeto(mens.mens)[2], this.getColorMetar(this.getVisibilidade(mens.mens), this.getTeto(mens.mens)[2]), this.getTurnoMetar(mens.validade_inicial, dataIni.substr(6, 2))]])
                )

                )
                if (response.data.last_page > 1){ 
                    let urlPages = getUrlPages(response.data.next_page_url)
                    getPages(urlBase + urlPages, response.data.last_page, callBack, resp,this)
                }
                else
                    callBack(resp)

                //pagesRequired = resp.data.pagesRequired;

                /*
                                    Promise.all(apiPromises)
                                        .then(responses => {
                                            //  const processedResponses = [];
                                            responses.map(response => {
                                                if (response.ok)
                                                    return response.json()
                                            })
                                        }
                
                                        )
                                }).then(response => {
                                    response.data.data.map((mens) => {
                                        resp = resp.concat([[mens.mens, this.getVisibilidade(mens.mens), this.getTeto(mens.mens)[2], this.getColorMetar(this.getVisibilidade(mens.mens), this.getTeto(mens.mens)[2]), this.getTurnoMetar(mens.validade_inicial, dataIni.substr(6, 2))]])
                                    })
                                }
                */


            })
        //return resp.slice(0)
    }

    setParametroTurno(manha, tarde, noite, noiteFim) {
        this.parametroTurno.manha = parseInt(manha)
        this.parametroTurno.tarde = parseInt(tarde)
        this.parametroTurno.noite = parseInt(noite)
        this.parametroTurno.noiteFim = parseInt(noiteFim)
    }

    getTurnoMetar(inicioValidade, diaRef) {
        diaRef = parseInt(diaRef)

        let inicio = new Date(inicioValidade).getHours()
        if (diaRef < new Date(inicioValidade).getDate())
            inicio += 24

        if (inicio > this.parametroTurno.noiteFim)
            return ""
        else if (inicio >= this.parametroTurno.noite)
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
const azul = "#1e90ff"
const verde = "#00ff00"
const amarelo = "#ffff00"
const ambar = "#ffbf00"
const vermelho = "#ff0000"

var arrayCores = []
arrayCores["azul"] = azul
arrayCores["verde"] = verde
arrayCores["amarelo"] = amarelo
arrayCores["ambar"] = ambar
arrayCores["vermelho"] = vermelho

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

    function getColorPicker(l, c) {
        return `<input type="color" list="coresPrev" class = "cpClass" id="cp${l}${c}" value="#1e90ff" oninput="updateIndice()">`
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
    let locs = document.getElementById('idLocalidade').value.toUpperCase().replaceAll(" ", "").split(",")
    locs.map((row, i) => (
        lines += arrayTurnos[row] ? `<tr><td>${row}</td><td class="${getColor(arrayTurnos[row]["MANHÃ"])}">${arrayTurnos[row]["MANHÃ"]}</td><td class="${getColor(arrayTurnos[row]["TARDE"])}">${arrayTurnos[row]["TARDE"]}</td><td class="${getColor(arrayTurnos[row]["NOITE"])}">${arrayTurnos[row]["NOITE"]}</td> </tr>` : `<tr><td>${row}</td><td>NIL</td><td>NIL</td><td>NIL</td></tr>`
    ))
    document.getElementById('tableRowsTurnos').innerHTML = lines

    lines = ""
    locs.map((row, i) => (
        lines += `<tr><td>${row}</td><td>${getColorPicker(row, 0)}</td><td>${getColorPicker(row, 1)}</td><td>${getColorPicker(row, 2)}</td> </tr>`
    ))

    document.getElementById('tableRowsTurnosPrev').innerHTML = lines

}

function getIdxPrevisao(cor) {
    if (cor == verde || cor == azul)
        return 1
    else if (cor == amarelo || cor == ambar)
        return 2
    else if (cor == vermelho)
        return 3
    return -1
}

function getPrevisao(localidade, turno) {
    let arrayT = ["MANHÃ", "TARDE", "NOITE"]
    let cor = document.getElementById(`cp${localidade}${arrayT.indexOf(turno)}`).value
    return getIdxPrevisao(cor)
}

function getObservado(localidade, turno) {
    //let arrayT = ["MANHÃ", "TARDE", "NOITE"]
    //let cor = (`cp${localidade}${arrayT.indexOf(turno)}`)
    let cor = arrayTurnos[localidade] ? arrayTurnos[localidade][turno] : -1
    if (cor == -1)
        return cor
    return getIdxPrevisao(arrayCores[cor.toLowerCase()])
}

function calculaIndice() {
    let totalPrevisoes = 0
    let totalAcertos = 0
    let turnos = ["MANHÃ", "TARDE", "NOITE"]

    Object.keys(arrayTurnos).forEach((loc) => {
        turnos.forEach((t) => {
            if (arrayTurnos[[loc]][t] !== "NIL") {
                totalPrevisoes++
                totalAcertos = getPrevisao(loc, t) == getObservado(loc, t) ? totalAcertos + 1 : totalAcertos
            }
        })


    })
    return totalPrevisoes > 0 ? totalAcertos / totalPrevisoes : 0
}

function updateArrayTurnos(localidade, status, turno) {
    arrayStatus = ["NIL", "AZUL", "VERDE", "AMARELO", "AMBAR", "VERMELHO"]
    if (!arrayTurnos[localidade]) {
        arrayTurnos[localidade] = []
        arrayTurnos[localidade]["MANHÃ"] = "NIL"
        arrayTurnos[localidade]["TARDE"] = "NIL"
        arrayTurnos[localidade]["NOITE"] = "NIL"
    }

    if ((arrayStatus.indexOf(status) > arrayStatus.indexOf(arrayTurnos[localidade][turno])))
        arrayTurnos[localidade][turno] = status
}

function updateIndice() {
    document.getElementById("labelIndice").innerHTML = `Índice de Acertos da Previsão: ${Math.round(calculaIndice() * 10000) / 100} %`
}
function getMetar(localidade, datai, dataf) {
    function done(mets) {
        setMetares(mets)
        updateIndice()
    }
    //const met = new Metar()
    (new Metar(getInicioManha(), getInicioTarde(), getInicioNoite(), getFimNoite())).get(done, localidade, datai, dataf) //a solicitação de Metar via fetch é assíncrona
}

function getColor(c) {
    return c?.toLowerCase()
}

function updateTable(dados) {
    console.log(dados)

}

function getInicioManha() {
    return document.getElementById("selectManha").value
}

function getInicioTarde() {
    return document.getElementById("selectTarde").value
}

function getInicioNoite() {
    return document.getElementById("selectNoite").value
}

function getFimNoite() {
    return document.getElementById("selectNoiteFim").value
}

function submitF() {
    function getNextDay(data) {
        return new Date(data.setDate(data.getDate() + 1))
    }
    //let metar = new Metar()
    let datai = document.getElementById('idData').value
    let dataf = getNextDay(new Date(datai.replaceAll('-','/')))
    datai = datai.replaceAll('-', '')
    dataf = getFormatedDate(dataf) + "05"
    getMetar(document.getElementById('idLocalidade').value, datai, dataf)
}

function getFormatedDate(data, separator = "") {
    let mes = data.getMonth() + 1 + ""
    let dia = data.getDate() + ""
    return `${data.getFullYear()}${separator}${mes.padStart(2, "0")}${separator}${dia.padStart(2, '0')}`
}

document.addEventListener("DOMContentLoaded", function () {
    /*document.getElementById('tablePrev').onclick = function (){
        updateIndice()
    }*/
    document.getElementById('idData').value = getFormatedDate(new Date(), '-')
}, false);
