/* Small offline QR encoder: byte mode, error correction level L, versions 1–5. */
(() => {
  const DATA_BLOCKS = [[19], [34], [55], [80], [108], [68, 68]];
  const ECC_CODEWORDS = [7, 10, 15, 20, 26, 18];
  const ALIGNMENT = [[], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34]];

  function multiply(x, y) {
    let result = 0;
    for (let i = 7; i >= 0; i--) {
      result = (result << 1) ^ ((result >>> 7) * 0x11d);
      result ^= ((y >>> i) & 1) * x;
    }
    return result;
  }

  function errorCorrection(data, degree) {
    let generator = [1];
    let root = 1;
    for (let i = 0; i < degree; i++) {
      const next = new Array(generator.length + 1).fill(0);
      generator.forEach((value, j) => {
        next[j] ^= value;
        next[j + 1] ^= multiply(value, root);
      });
      generator = next;
      root = multiply(root, 2);
    }
    const remainder = new Array(degree).fill(0);
    for (const byte of data) {
      const factor = byte ^ remainder.shift();
      remainder.push(0);
      for (let i = 0; i < degree; i++) remainder[i] ^= multiply(generator[i + 1], factor);
    }
    return remainder;
  }

  function encode(text) {
    const bytes = Array.from(new TextEncoder().encode(text));
    const version = DATA_BLOCKS.findIndex((blocks, i) => bytes.length <= blocks.reduce((a,b) => a+b, 0) - 2);
    if (version < 0) throw new Error("Texto longo demais para o QR local (limite aproximado: 134 bytes).");
    const ver = version + 1;
    const dataCapacity = DATA_BLOCKS[version].reduce((a,b) => a+b, 0);
    const bits = [];
    const pushBits = (value, count) => { for (let i = count - 1; i >= 0; i--) bits.push((value >>> i) & 1); };
    pushBits(4, 4);
    pushBits(bytes.length, 8);
    bytes.forEach(byte => pushBits(byte, 8));
    for (let i = 0; i < Math.min(4, dataCapacity * 8 - bits.length); i++) bits.push(0);
    while (bits.length % 8) bits.push(0);
    const data = [];
    for (let i = 0; i < bits.length; i += 8) data.push(bits.slice(i, i + 8).reduce((n, bit) => (n << 1) | bit, 0));
    for (let pad = 0; data.length < dataCapacity; pad++) data.push(pad % 2 ? 0x11 : 0xec);
    let offset = 0;
    const blocks = DATA_BLOCKS[version].map(length => {
      const block = data.slice(offset, offset + length); offset += length;
      return {data:block, ecc:errorCorrection(block, ECC_CODEWORDS[version])};
    });
    const codewords = [];
    for (let i = 0; i < Math.max(...blocks.map(block => block.data.length)); i++)
      blocks.forEach(block => { if (i < block.data.length) codewords.push(block.data[i]); });
    for (let i = 0; i < ECC_CODEWORDS[version]; i++) blocks.forEach(block => codewords.push(block.ecc[i]));

    const size = 17 + ver * 4;
    const matrix = Array.from({length:size}, () => Array(size).fill(false));
    const reserved = Array.from({length:size}, () => Array(size).fill(false));
    const setFunction = (x, y, dark) => { matrix[y][x] = dark; reserved[y][x] = true; };
    const finder = (cx, cy) => {
      for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
        const x = cx + dx, y = cy + dy;
        if (x < 0 || y < 0 || x >= size || y >= size) continue;
        const distance = Math.max(Math.abs(dx), Math.abs(dy));
        setFunction(x, y, distance !== 2 && distance !== 4);
      }
    };
    finder(3, 3); finder(size - 4, 3); finder(3, size - 4);
    for (const y of ALIGNMENT[version]) for (const x of ALIGNMENT[version]) {
      if (reserved[y][x]) continue;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++)
        setFunction(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }
    for (let i = 8; i < size - 8; i++) {
      if (!reserved[6][i]) setFunction(i, 6, i % 2 === 0);
      if (!reserved[i][6]) setFunction(6, i, i % 2 === 0);
    }
    // Reserve and write the level-L, mask-0 format information.
    const formatData = 0b01000;
    let rem = formatData;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ (((rem >>> 9) & 1) * 0x537);
    const format = ((formatData << 10) | rem) ^ 0x5412;
    const formatA = [[8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[8,7],[8,8],[7,8],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8]];
    const formatB = [[size-1,8],[size-2,8],[size-3,8],[size-4,8],[size-5,8],[size-6,8],[size-7,8],[size-8,8],[8,size-7],[8,size-6],[8,size-5],[8,size-4],[8,size-3],[8,size-2],[8,size-1]];
    const writeFormat = () => {
      formatA.forEach(([x,y],i) => setFunction(x,y,((format >>> i)&1)!==0));
      formatB.forEach(([x,y],i) => setFunction(x,y,((format >>> i)&1)!==0));
      setFunction(8, size - 8, true);
    };
    writeFormat();

    let bitIndex = 0;
    for (let right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let vert = 0; vert < size; vert++) {
        const y = ((right + 1) & 2) === 0 ? size - 1 - vert : vert;
        for (let offset = 0; offset < 2; offset++) {
          const x = right - offset;
          if (reserved[y][x]) continue;
          const dark = bitIndex < codewords.length * 8 && ((codewords[bitIndex >>> 3] >>> (7 - (bitIndex & 7))) & 1) !== 0;
          matrix[y][x] = dark !== ((x + y) % 2 === 0);
          bitIndex++;
        }
      }
    }
    writeFormat();
    return matrix;
  }

  window.QRCodeLocal = {
    draw(canvas, text, size = 160) {
      const matrix = encode(text);
      const quiet = 4;
      const modules = matrix.length + quiet * 2;
      const scale = Math.max(1, Math.floor(size / modules));
      canvas.width = canvas.height = modules * scale;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      const context = canvas.getContext("2d");
      context.fillStyle = "#fff"; context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "#000";
      matrix.forEach((row,y) => row.forEach((dark,x) => {
        if (dark) context.fillRect((x + quiet) * scale, (y + quiet) * scale, scale, scale);
      }));
    }
  };
})();
