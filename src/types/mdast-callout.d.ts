// Extend mdast types to include callout nodes
import type { Parent, PhrasingContent } from 'mdast';

declare module 'mdast' {
    interface CalloutNode extends Parent {
        type: 'callout';
        calloutType: string;  // The string from [!<string>]
        title?: string;      // Optional title after the type
        children: PhrasingContent[];
    }

    interface RootContentMap {
        callout: CalloutNode;
    }
}
