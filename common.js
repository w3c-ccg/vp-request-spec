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



// We should be able to remove terms that are not actually
// referenced from the common definitions
//
// the termlist is in a block of class 'termlist', so make sure that
// has an ID and put that ID into the termLists array so we can
// interrogate all of the included termlists later.
var termNames = [] ;
var termLists = [] ;
var termsReferencedByTerms = [] ;

function restrictReferences(utils, content) {
    'use strict';
    var base = document.createElement('div');
    base.innerHTML = content;

    // New new logic:
    //
    // 1. build a list of all term-internal references
    // 2. When ready to process, for each reference INTO the terms,
    // remove any terms they reference from the termNames array too.
    $.each(base.querySelectorAll('dfn'), function(i, item) {
        var $t = $(item) ;
        var titles = $t.getDfnTitles();
        var dropit = false;
        // do we have an omitTerms
        if (window.hasOwnProperty('omitTerms')) {
            // search for a match
            $.each(omitTerms, function(j, term) {
                if (titles.indexOf(term) !== -1) {
                    dropit = true;
                }
            });
        }
        // do we have an includeTerms
        if (window.hasOwnProperty('includeTerms')) {
            var found = false;
            // search for a match
            $.each(includeTerms, function(j, term) {
                if (titles.indexOf(term) !== -1) {
                    found = true;
                }
            });
            if (!found) {
                dropit = true;
            }
        }
        if (dropit) {
            $t.parent().next().remove();
            $t.parent().remove();
        } else {
            var n = $t.makeID('dfn', titles[0]);
            if (n) {
                termNames[n] = $t.parent() ;
            }
        }
    });

    var $container = $('.termlist',base) ;
    var containerID = $container.makeID('', 'terms') ;
    termLists.push(containerID) ;

    return (base.innerHTML);
}
// add a handler to come in after all the definitions are resolved
//
// New logic: If the reference is within a 'dl' element of
// class 'termlist', and if the target of that reference is
// also within a 'dl' element of class 'termlist', then
// consider it an internal reference and ignore it.

require(['core/pubsubhub'], function(respecEvents) {
    'use strict';
    respecEvents.sub('end', function(message) {
        if (message === 'core/link-to-dfn') {
            // all definitions are linked; find any internal references
            $('.termlist a.internalDFN').each(function() {
                var $r = $(this);
                var id = $r.attr('href');
                var idref = id.replace(/^#/,'') ;
                if (termNames[idref]) {
                    // this is a reference to another term
                    // what is the idref of THIS term?
                    var $def = $r.closest('dd') ;
                    if ($def.length) {
                        var $p = $def.prev('dt').find('dfn') ;
                        var tid = $p.attr('id') ;
                        if (tid) {
                            if (termsReferencedByTerms[tid]) {
                                termsReferencedByTerms[tid].push(idref);
                            } else {
                                termsReferencedByTerms[tid] = [] ;
                                termsReferencedByTerms[tid].push(idref);
                            }
                        }
                    }
                }
            }) ;

            // clearRefs is recursive.  Walk down the tree of
            // references to ensure that all references are resolved.
            var clearRefs = function(theTerm) {
                if ( termsReferencedByTerms[theTerm] ) {
                    $.each(termsReferencedByTerms[theTerm], function(i, item) {
                        if (termNames[item]) {
                            delete termNames[item];
                            clearRefs(item);
                        }
                    });
                }
                // make sure this term doesn't get removed
                if (termNames[theTerm]) {
                    delete termNames[theTerm];
                }
            };

            // now termsReferencedByTerms has ALL terms that
            // reference other terms, and a list of the
            // terms that they reference
            $('a.internalDFN').each(function () {
                var $item = $(this) ;
                var t = $item.attr('href');
                var r = t.replace(/^#/,'') ;
                // if the item is outside the term list
                if ( ! $item.closest('dl.termlist').length ) {
                    clearRefs(r);
                }
            });

            // delete any terms that were not referenced.
            /*
            Object.keys(termNames).forEach(function(term) {
                var $p = $('#'+term) ;
                if ($p) {
                    var tList = $p.getDfnTitles();
                    $p.parent().next().remove();
                    $p.parent().remove() ;
                    tList.forEach(function( item ) {
                      console.log('CHECKING ITEM', item, respecConfig);
                        if (respecConfig.definitionMap[item]) {
                            delete respecConfig.definitionMap[item];
                        }
                    });
                }
            });*/
        }
    });
});