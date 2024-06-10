const { fromCharCode } = String;

exports.compress = async (buffer, { format = 'deflate' } = {}) => {
    const stream = new CompressionStream(format);
    const blob = new Blob([buffer]).stream().pipeThrough(stream);
    const arrayBuffer = await new Response(blob).arrayBuffer();
    const view = new Uint8Array(arrayBuffer);
    const out = [];
    for (let i = 0; i < view.length; i += 2000)
        out.push(fromCharCode.apply(null, view.subarray(i, i + 2000)));
    return btoa(out.join(''));
};

exports.decompress = async (bota, { format = 'deflate' } = {}) => {
    const str = atob(bota);
    const buffer = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++)
        buffer[i] = str[i].charCodeAt(0);
    const stream = new DecompressionStream(format);
    const blob = new Blob([buffer]).stream().pipeThrough(stream);
    const arrayBuffer = await new Response(blob).arrayBuffer();
    return arrayBuffer;
};
