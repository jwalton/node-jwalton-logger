import * as logform from 'logform';
import * as path from 'path';

export interface PrefixFormatOptions {
    basepath?: string;
}

/**
 * This is a debug format, used to prefix the message with tags and filenames.
 *
 * This copies values to `message`, and strips values out of the `info` so
 * they won't get displayed as "extra values" by `winston-format-debug`.
 */
export class PrefixFormat {
    private readonly _basepath: string | undefined;
    constructor(options: PrefixFormatOptions = {}) {
        this._basepath = options.basepath || process.cwd();
    }

    transform(info: logform.TransformableInfo, options: PrefixFormatOptions = {}): any {
        let prefix: string[] = [];

        if (info.tags) {
            prefix = prefix.concat(info.tags.map((t: string) => `#${t}`));
            info.tags = undefined;
        }

        if (prefix.length && info.message) {
            info.message = `[${prefix.join(', ')}] ${info.message}`;
            info.tags = undefined;
        }

        if (info.src && info.src.file) {
            info.message = `${toShortFilename(
                info.src.file,
                this._basepath || options.basepath
            )}: ${info.message}`;
            info.src = undefined;
        }

        return info;
    }
}

export default function (): PrefixFormat {
    return new PrefixFormat();
}

// Transforms "/src/foo/bar.coffee" to "/s/f/bar".
// Transforms "/src/foo/index.coffee" to "/s/foo/".
function toShortFilename(filename: string, basepath: string | null = null, replacement = './') {
    let shortenIndex;
    if (typeof basepath === 'string') {
        if (!basepath.endsWith(path.sep)) {
            basepath += path.sep;
        }
        filename = filename.replace(basepath, replacement);
    }

    const parts = filename.split(path.sep);

    let file = parts[parts.length - 1];
    const ext = path.extname(file);
    file = path.basename(file, ext);

    if (file === 'index') {
        shortenIndex = parts.length - 3;
        file = '';
    } else {
        shortenIndex = parts.length - 2;
    }

    // Strip the extension
    parts[parts.length - 1] = file;
    for (let index = 0; index < parts.length; index++) {
        if (index <= shortenIndex) {
            if (parts[index].startsWith('@')) {
                parts[index] = parts[index].slice(0, 2);
            } else {
                parts[index] = parts[index].slice(0, 1);
            }
        }
    }

    return parts.join('/');
}
