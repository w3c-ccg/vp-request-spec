/* globals omitTerms, respecConfig, $, require */
/* exported linkCrossReferences, restrictReferences, fixIncludes */

var ccg = {
  // Add as the respecConfig localBiblio variable
  // Extend or override global respec references
  localBiblio: {
    'REST': {
      title: 'Architectural Styles and the Design of Network-based Software Architectures',
      date: '2000',
      href: 'http://www.ics.uci.edu/~fielding/pubs/dissertation/',
      authors: [
        'Roy Thomas Fielding'
      ],
      publisher: 'University of California, Irvine.'
    },
    'VC-EXTENSION-REGISTRY': {
      title: 'Verifiable Credentials Extension Registry',
      href: 'https://w3c-ccg.github.io/vc-extension-registry/',
      authors: [
        'Manu Sporny'
      ],
      status: 'CG-DRAFT',
      publisher: 'Credentials Community Group'
    },
    'STRING-META': {
      title: 'Strings on the Web: Language and Direction Metadata',
      href: 'https://www.w3.org/TR/string-meta/',
      authors: [
        'Addison Phillips',
        'Richard Ishida'
      ],
      status: 'WD',
      publisher: 'Internationalization Working Group'
    },
    'LD-PROOFS': {
      title: 'Linked Data Proofs',
      href: 'https://w3c-dvcg.github.io/ld-proofs/',
      authors: [
        'Manu Sporny',
        'Dave Longley'
      ],
      status: 'CG-DRAFT',
      publisher: 'Digital Verification Community Group'
    },
    'LD-SIGNATURES': {
      title: 'Linked Data Signatures',
      href: 'https://w3c-dvcg.github.io/ld-signatures/',
      authors: [
        'Manu Sporny',
        'Dave Longley'
      ],
      status: 'CG-DRAFT',
      publisher: 'Digital Verification Community Group'
    },
    'LDS-RSA2018': {
      title: 'The 2018 RSA Linked Data Signature Suite',
      href: 'https://w3c-dvcg.github.io/lds-rsa2018/',
      authors: [
        'Manu Sporny',
        'Dave Longley'
      ],
      status: 'CG-DRAFT',
      publisher: 'Digital Verification Community Group'
    },
    'MULTIBASE': {
      title: 'Multibase',
      href: 'https://tools.ietf.org/html/draft-multiformats-multibase',
      authors: [
        'Juan Benet',
        'Manu Sporny'
      ],
      status: 'Independent Draft',
      publisher: 'IETF'
    },
    'MULTICODEC': {
      title: 'Multibase',
      href: 'https://github.com/multiformats/multicodec/blob/master/README.md',
      authors: [
        'Juan Benet',
        'Manu Sporny'
      ],
      status: 'Independent Draft',
      publisher: 'IETF'
    },
    // aliases to known references
    'HTTP-SIGNATURES': {
      aliasOf: 'http-signatures'
    },
    'DEMOGRAPHICS': {
      title: 'Simple Demographics Often Identify People Uniquely',
      href: 'http://dataprivacylab.org/projects/identifiability/paper1.pdf',
      authors: [
        'Latanya Sweeney'
      ],
      publisher: 'Data Privacy Lab'
    },
    'HASHLINK': {
      title: 'Cryptographic Hyperlinks',
      href: 'https://tools.ietf.org/html/draft-sporny-hashlink',
      authors: [
        'Manu Sporny'
      ],
      status: 'Internet-Draft',
      publisher: 'Internet Engineering Task Force (IETF)'
    },
    'IPFS': {
      title: 'InterPlanetary File System (IPFS)',
      href: 'https://en.wikipedia.org/wiki/InterPlanetary_File_System',
      publisher: 'Wikipedia'
    },
    'JSON-SCHEMA-2018': {
      title: 'JSON Schema: A Media Type for Describing JSON Documents',
      href: 'https://tools.ietf.org/html/draft-handrews-json-schema',
      authors: [
        'Austin Wright',
        'Henry Andrews'
      ],
      status: 'Internet-Draft',
      publisher: 'Internet Engineering Task Force (IETF)'
    },
    'JSON-LD': {
      title: 'JSON-LD 1.1: A JSON-based Serialization for Linked Data',
      href: 'https://www.w3.org/TR/json-ld11/',
      authors: [
        'Gregg Kellogg',
        'Manu Sporny',
        'Dave Longley',
        'Markus Lanthaler',
        'Pierre-Antoine Champin',
        'Niklas Lindström'
      ],
      status: 'WD',
      publisher: 'W3C JSON-LD 1.1 Working Group'
    }
  }
};

// Removes dfns that aren't referenced anywhere in the spec.
// To ensure a definition appears in the Terminology section, use
//  and link to it!
// This is triggered by postProcess in the respec config.
function restrictRefs(config, document){

  // Get set of ids internal dfns referenced in the spec body
  const internalDfnLinks = document.querySelectorAll("a.internalDFN");
  let internalDfnIds = new Set();
  for (const dfnLink of internalDfnLinks) {
    const dfnHref = dfnLink.href.split("#")[1];
    internalDfnIds.add(dfnHref);
  }

  // Remove unused dfns from the termlist
  const termlist = document.querySelector(".termlist");
  const linkIdsInDfns = [];
  for (const child of termlist.querySelectorAll("dfn")){
    if (!internalDfnIds.has(child.id)){
      let dt = child.closest("dt");
      let dd = dt.nextElementSibling;

      // Get internal links from dfns we're going to remove
      //  because these show up in the dfn-panels later and then
      //  trigger the local-refs-exist linter (see below)
      const linksInDfn = dd.querySelectorAll("a.internalDFN");
      for (link of linksInDfn) {
        linkIdsInDfns.push(link.id);
      }

      termlist.removeChild(dt);
      termlist.removeChild(dd);
    }
  }

  // Remove unused dfns from the dfn-panels
  //  (these are hidden, but still trigger the local-refs-exist linter)
  //  (this seems like a hack, there's probably a better way to hook into respec
  //   before it gets to this point)
  const dfnPanels = document.querySelectorAll(".dfn-panel");
  for (const panel of dfnPanels) {
    if (!internalDfnIds.has(panel.querySelector(".self-link").href.split("#")[1])){
      panel.parentNode.removeChild(panel);
    }

    // Remove references to dfns we removed which link to other dfns
    const panelLinks = panel.querySelectorAll("li a");
    for (const link of panelLinks) {
      if (linkIdsInDfns.includes(link.href.split("#")[1])) {
        link.parentNode.removeChild(link);
      }
    }
  }

}

