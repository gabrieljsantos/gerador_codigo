#!/usr/bin/env python3
"""Gera e compila sketches dos geradores Wi-Fi e Blocks tradicionais.

Requer apenas Python para gerar os sketches e arduino-cli configurado com
uma plataforma compatível (padrão: esp32:esp32:esp32).
O gerador blocos_wifi não é incluído nesta bateria.
"""

from __future__ import annotations

import argparse
import datetime as dt
import html
import json
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile


ROOT = Path(__file__).resolve().parents[1]
OUT_DEFAULT = ROOT / "relatorios" / "compilacao"
ARDUINO_DATA = Path.home() / ".arduino15"


def run(cmd: list[str], *, cwd: Path | None = None, timeout: int = 300):
    try:
        p = subprocess.run(cmd, cwd=cwd, text=True, stdout=subprocess.PIPE,
                           stderr=subprocess.STDOUT, timeout=timeout)
        return p.returncode, p.stdout
    except subprocess.TimeoutExpired as exc:
        output = exc.stdout or ""
        if isinstance(output, bytes):
            output = output.decode(errors="replace")
        return 124, output + f"\nTempo limite excedido ({timeout}s)."


def write_sketch(out: Path, generator: str, case: str, code: str) -> dict:
    directory = out / generator / case
    directory.mkdir(parents=True, exist_ok=True)
    for old_sketch in directory.glob("*.ino"):
        old_sketch.unlink()
    sketch = directory / f"{case}.ino"
    sketch.write_text(code, encoding="utf-8")
    return {"generator": "Wi-Fi" if generator == "wifi" else "Blocos tradicional",
            "case": case, "sketch": str(sketch.relative_to(out))}


def generate_sketches(destination: Path) -> list[dict]:
    """Extrai o firmware base e cria uma compilação por layout/caso de blocos."""
    wifi_source = (ROOT / "wifi" / "app.js").read_text(encoding="utf-8")
    layouts_match = re.search(r"const layouts = (\{.*?\});\s*\n\s*const state", wifi_source, re.S)
    if not layouts_match:
        raise RuntimeError("Não foi possível ler o catálogo de layouts de wifi/app.js")
    layouts = json.loads(layouts_match.group(1))
    template_match = re.search(r"return `(#include <WiFi\.h>[\s\S]*?)`;\s*\n}\s*\n\s*function updateSummary", wifi_source)
    if not template_match:
        raise RuntimeError("Não foi possível extrair o template de firmware de wifi/app.js")
    # Match JavaScript template-literal escapes. A doubled slash preserves a
    # literal C++ \n; a single slash-n becomes a real newline in generated C++.
    escaped_newline = "__CTRL_FORGE_ESCAPED_NEWLINE__"
    template = template_match.group(1).replace(r"\\n", escaped_newline)
    template = template.replace(r"\n", "\n").replace(escaped_newline, r"\n")
    # Protect JavaScript expressions from the embedded controller pages.
    js_expressions = set(re.findall(r"\$\{[^}]+\}", "\n".join(layouts.values())))
    js_markers = {}
    for index, expression in enumerate(sorted(js_expressions)):
        marker = f"__JS_TEMPLATE_{index}__"
        js_markers[marker] = expression
        layouts = {key: page.replace(expression, marker) for key, page in layouts.items()}
    # Resolve substitutions performed by the application's outer C++ template.
    for expression, value in (("${state.layout}", "__LAYOUT_NAME__"), ("${ssid}", "ROBO_ESP32"),
                              ("${password}", "12345678"), ("${deviceName}", "robo-teste"),
                              ("${stationMode}", "false"), ("${p.motorA_frente}", "18"),
                              ("${p.motorA_re}", "32"), ("${p.motorB_frente}", "27"),
                              ("${p.motorB_re}", "26"), ("${html}", "__CONTROL_HTML__")):
        template = template.replace(expression, value)
    results = []
    for name, page in layouts.items():
        code = template.replace("__CONTROL_HTML__", 'R"CTRLFORGE(' + page + ')CTRLFORGE"')
        code = code.replace("__LAYOUT_NAME__", name)
        for marker, expression in js_markers.items():
            code = code.replace(marker, expression)
        results.append(write_sketch(destination, "wifi", name, code))

    blocks_source = (ROOT / "blocos" / "app.js").read_text(encoding="utf-8")
    # O template do gerador é independente do DOM; avaliar as mesmas funções de
    # transformação em Python evita exigir Node.js apenas para montar os casos.
    marker = "return `/*"
    start = blocks_source.index(marker) + len("return `")
    end = blocks_source.index("`;\n}", start)
    template = blocks_source[start:end].replace(r"\n", "\n")
    pins = {"lf":18,"lr":32,"rf":27,"rr":26}

    def make_blocks(body: str, setup: str = "", variables: str = "", name: str = "teste") -> str:
        code = template.replace("${safeName(state.name,\"meu_carrinho\")}", name)
        code = code.replace("${state.hardware[0].pin}", "18").replace("${state.hardware[1].pin}", "32")
        code = code.replace("${state.hardware[2].pin}", "27").replace("${state.hardware[3].pin}", "26")
        code = code.replace("${p.lf}", "18").replace("${p.lr}", "32")
        code = code.replace("${p.rf}", "27").replace("${p.rr}", "26")
        code = code.replace('${vars.length?"\n// Variáveis criadas nos blocos\n"+vars.map(v=>`long ${v} = 0;`).join("\n")+"\n":""}', variables)
        code = code.replace("${setupProgram}", setup or "  // Nenhum bloco de inicialização.")
        code = code.replace("${loopProgram}", body or "  // Adicione blocos na área de programação.\n  delay(10);")
        return code

    block_cases = {
        "vazio": make_blocks("", name="teste_vazio"),
        "motores": make_blocks("  motorAFrente(255);\n  motorBTras(180);", name="teste_motores"),
        "gpio_pulso": make_blocks("  digitalWrite(GPIO_1, HIGH);\n  digitalWrite(GPIO_2, LOW);\n  delay(250);\n  digitalWrite(GPIO_2, HIGH);", name="teste_gpio_pulso"),
        "controle_variaveis": make_blocks("  while (true) {\n    for (int i_12345 = 0; i_12345 < 3; i_12345++) {\n      contador += 1;\n      if (contador < 5) {\n        motorAFrente(200);\n      } else {\n        pararMotorA();\n      }\n      delay(50);\n      // ciclo de teste\n    }\n  }", "  contador = 0;", "\n// Variáveis criadas nos blocos\nlong contador = 0;\n", "teste_controle_variaveis"),
    }
    for name, code in block_cases.items():
        results.append(write_sketch(destination, "blocos", name, code))
    (destination / "casos.json").write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    return results


def generate_downloaded_sketches(node: str, destination: Path) -> list[dict]:
    """Run each page's real generateFirmware() function with a small DOM shim."""
    runner = r'''
const fs=require('fs'),vm=require('vm'),path=require('path');
const root=process.argv[1],out=process.argv[2],results=[];
function el(value=''){return {value,textContent:'',innerHTML:'',className:'',srcdoc:'',
 classList:{toggle(){},add(){},remove(){}},style:{},dataset:{},addEventListener(){},
 appendChild(){},remove(){},click(){},select(){},insertAdjacentHTML(){},replaceChildren(){},
 querySelectorAll(){return []}}}
function load(file,values){
 const els={};for(const [k,v] of Object.entries(values))els[k]=el(v);
 const get=id=>els[id]||(els[id]=el());
 const document={getElementById:get,querySelector(s){const m=s.match(/^#([\w-]+)$/);return m?get(m[1]):el()},
  querySelectorAll(){return []},createElement(){return el()},body:el(),addEventListener(){}};
 const ctx={console,document,window:{addEventListener(){},open(){}},
  localStorage:{getItem(){return null},setItem(){}},URL:{createObjectURL(){return ''},revokeObjectURL(){}},
  Blob:function(){},structuredClone:x=>JSON.parse(JSON.stringify(x)),setTimeout:()=>0,clearTimeout(){},
  navigator:{clipboard:{writeText:async()=>{}}}};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync(file,'utf8'),ctx,{filename:file});return {ctx,get};
}
function save(generator,name,code){const dir=path.join(out,generator,name);fs.mkdirSync(dir,{recursive:true});
 for(const f of fs.readdirSync(dir))if(f.endsWith('.ino'))fs.unlinkSync(path.join(dir,f));
 const file=path.join(dir,name+'.ino');fs.writeFileSync(file,code);results.push({generator:generator==='wifi'?'Wi-Fi':'Blocos tradicional',case:name,sketch:path.relative(out,file)});}
const w=load(path.join(root,'wifi/app.js'),{ssid:'ROBO_ESP32',password:'12345678',deviceName:'robo-teste',wifiMode:'ap',pinMap:'',preview:'',message:'',summary:''});
for(const name of Object.keys(vm.runInContext('layouts',w.ctx))){
 vm.runInContext(`state.layout=${JSON.stringify(name)}`,w.ctx);
 save('wifi',name,vm.runInContext('generateFirmware()',w.ctx));
}
const b=load(path.join(root,'blocos/app.js'),{workspace:'',hardwareGrid:'',hardwareStatus:'',summary:'',projectName:'teste',wifiMode:'ap',ssid:'CTRL-FORGE',password:'12345678',deviceName:'robo-teste',message:'',codePreview:'',blockCount:''});
const mk=(type,fields={},children=[],elseChildren=[])=>({id:'b'+Math.random().toString(36).slice(2,8),type,fields,children,elseChildren});
const cases=[
 ['vazio',[]],
 ['motores',[mk('start',{},[mk('motor_a_forward',{power:'255'}),mk('motor_b_backward',{power:'180'})])]],
 ['gpio_pulso',[mk('start',{},[mk('gpio',{slot:'0',level:'HIGH'}),mk('pulse',{slot:'1',level:'LOW',duration:'250'})])]],
 ['controle_variaveis',[mk('start',{},[mk('setvar',{variable:'contador',value:'0'})]),mk('forever',{},[mk('repeat',{count:'3'},[mk('changevar',{variable:'contador',value:'1'}),mk('ifelse',{variable:'contador',operator:'<',value:'5'},[mk('motor_a_forward',{power:'200'})],[mk('motor_a_stop')]),mk('wait',{duration:'50'}),mk('comment',{text:'ciclo de teste'})])])]]
];
for(const [name,blocks] of cases){
 vm.runInContext(`state.name=${JSON.stringify('teste_'+name)};state.blocks=JSON.parse(${JSON.stringify(JSON.stringify(blocks))})`,b.ctx);
 save('blocos',name,vm.runInContext('generateFirmware()',b.ctx));
}
fs.writeFileSync(path.join(out,'casos.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results));
'''
    proc = subprocess.run([node, "-e", runner, str(ROOT), str(destination)],
                          text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    if proc.returncode:
        raise RuntimeError("Falha ao chamar os geradores reais da página:\n" + proc.stdout)
    return json.loads(proc.stdout.strip().splitlines()[-1])


def compile_case(cli: str, fqbn: str, out: Path, case: dict, timeout: int):
    sketch = out / case["sketch"]
    build_dir = out / "build"
    build_dir.mkdir(parents=True, exist_ok=True)
    config = build_dir / "arduino-cli.yaml"
    config.write_text("board_manager:\n  additional_urls: []\n", encoding="utf-8")
    cmd = [cli, "--config-file", str(config), "compile", "--fqbn", fqbn,
           "--build-path", str(build_dir / "esp32"), str(sketch.parent)]
    code, output = run(cmd, timeout=timeout)
    case.update(status="compilou" if code == 0 else "falhou", exit_code=code,
                build_log=str(Path("logs") / f"{case['generator'].replace(' ','_')}_{case['case']}.txt"))
    logpath = out / case["build_log"]
    logpath.parent.mkdir(parents=True, exist_ok=True)
    logpath.write_text(output, encoding="utf-8")
    errors = [line.strip() for line in output.splitlines()
              if re.search(r"error:|fatal error:|Error:|No such file", line, re.I)]
    case["errors"] = errors[:12] or ([line.strip() for line in output.splitlines() if line.strip()][-8:])
    return code


def write_reports(out: Path, results: list[dict], metadata: dict):
    summary = {"metadata": metadata, "results": results,
               "counts": {key: sum(r.get("status") == key for r in results)
                          for key in ("compilou", "falhou", "não executado")}}
    (out / "relatorio.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    lines = ["# Relatório de compilação dos geradores", "",
             f"Gerado em: {metadata['generated_at']}", f"Compilador: {metadata.get('compiler','não encontrado')}",
             f"Placa: `{metadata['fqbn']}`", "",
             f"**Resultado:** {summary['counts']['compilou']} compilados, {summary['counts']['falhou']} falharam, {summary['counts']['não executado']} não executados.", "",
             "O gerador `blocos_wifi` foi excluído conforme solicitado.", "",
             "| Gerador | Caso | Resultado | Diagnóstico |", "|---|---|---|---|"]
    for r in results:
        diag = "; ".join(r.get("errors", [])) or r.get("reason", "—")
        lines.append(f"| {r['generator']} | {r['case']} | {r.get('status','não executado')} | {diag.replace('|','\\|')} |")
    lines += ["", "Os logs completos ficam na pasta `logs/`; os sketches compilados ficam organizados por gerador e caso.", ""]
    (out / "relatorio.md").write_text("\n".join(lines), encoding="utf-8")
    rows="".join(f"<tr><td>{html.escape(r['generator'])}</td><td>{html.escape(r['case'])}</td><td>{html.escape(r.get('status','não executado'))}</td><td><pre>{html.escape('; '.join(r.get('errors',[])) or r.get('reason','—'))}</pre></td></tr>" for r in results)
    (out / "relatorio.html").write_text("<!doctype html><meta charset='utf-8'><title>Relatório</title><style>body{font:15px system-ui;max-width:1100px;margin:2rem auto;padding:0 1rem;background:#101116;color:#eee}table{border-collapse:collapse;width:100%}td,th{border:1px solid #444;padding:.6rem;text-align:left}pre{white-space:pre-wrap;color:#ffb4aa}</style><h1>Relatório de compilação</h1><p>"+html.escape(f"{summary['counts']['compilou']} compilados · {summary['counts']['falhou']} falharam · {summary['counts']['não executado']} não executados · {metadata.get('fqbn')}")+"</p><p>blocos_wifi excluído.</p><table><thead><tr><th>Gerador</th><th>Caso</th><th>Resultado</th><th>Diagnóstico</th></tr></thead><tbody>"+rows+"</tbody></table>",encoding="utf-8")


def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--output",type=Path,default=OUT_DEFAULT,help="Pasta de saída do relatório")
    ap.add_argument("--cli",default="arduino-cli",help="Executável arduino-cli")
    ap.add_argument("--fqbn",default="esp32:esp32:esp32",help="Identificador da placa Arduino")
    ap.add_argument("--timeout",type=int,default=300,help="Limite de segundos por compilação")
    args=ap.parse_args()
    out=args.output.resolve();out.mkdir(parents=True,exist_ok=True)
    for folder in ("wifi", "blocos", "logs", "build"):
        target = out / folder
        if target.exists():
            shutil.rmtree(target, ignore_errors=True)
    cli=shutil.which(args.cli)
    node=shutil.which("node")
    if not node:
        ap.error("Node.js é necessário para chamar generateFirmware() da página e compilar o .ino efetivamente exportado.")
    results=generate_downloaded_sketches(node,out)
    installed_cores = sorted((ARDUINO_DATA / "packages").glob("*/hardware/esp32/*"))
    core_version = installed_cores[-1].name if installed_cores else None
    metadata={"generated_at":dt.datetime.now().astimezone().isoformat(timespec="seconds"),
              "fqbn":args.fqbn,"compiler":cli or "arduino-cli ausente",
              "esp32_core":core_version,
              "generation":"generateFirmware() real da página, salvo como .ino exportado",
              "node":node,
              "excluded":"blocos_wifi"}
    if not cli:
        for r in results:
            r.update(status="não executado",reason="arduino-cli não instalado ou não está no PATH")
        write_reports(out,results,metadata)
        print(f"arduino-cli não encontrado. Sketches e relatório salvos em {out}")
        if core_version:
            print(f"Core ESP32 {core_version} já instalado em {ARDUINO_DATA}; falta apenas o arduino-cli.")
            print("Instale o Arduino CLI e rode novamente; não é necessário reinstalar o core.")
        else:
            print("Instale o Arduino CLI e a plataforma ESP32; depois execute o script novamente.")
        return 2
    version_code,version=run([cli,"version"])
    metadata["compiler_version"]=version.strip()
    for result in results:
        compile_case(cli,args.fqbn,out,result,args.timeout)
        print(f"{result['status']}: {result['generator']} / {result['case']}")
    write_reports(out,results,metadata)
    print(f"Relatórios salvos em {out}")
    return 0 if all(r["status"]=="compilou" for r in results) else 1


if __name__=="__main__":
    sys.exit(main())
