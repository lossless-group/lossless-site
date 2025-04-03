// Extend mdast types to include our custom nodes
import type { Parent, Literal, PhrasingContent } from 'mdast';

declare module 'mdast' {
    interface BacklinkNode extends Parent {
        type: 'backlink';
        target: string;
        displayText?: string;
        children: PhrasingContent[];
    }

    interface RootContentMap {
        backlink: BacklinkNode;
    }
}
