// Request ids reject acknowledgements that arrive after a cancelled timeout.
function createCloseCheckpoint({ flush, resume, close, warn, record, schedule = setTimeout, cancel = clearTimeout }) {
    let sequence = 0;
    let pending = null;
    let closing = false;

    async function failed(request, reason) {
        if (!pending || pending.id !== request || pending.deciding) return;
        pending.deciding = true;
        cancel(pending.timer);
        record(reason);
        let discard = false;
        try { discard = await warn(); } catch { /* Keep the business open if the dialog fails. */ }
        if (!pending || pending.id !== request) return;
        pending = null;
        if (discard) { closing = true; close(); }
        else resume();
    }

    return {
        request(event) {
            if (closing) return;
            event.preventDefault();
            if (pending) return;
            const id = ++sequence;
            pending = { id, deciding: false, timer: schedule(() => { void failed(id, 'close-timeout'); }, 5000) };
            try { flush(id); } catch { void failed(id, 'close-save-failed'); }
        },
        acknowledge(id, success) {
            if (!pending || pending.id !== id || pending.deciding) return;
            if (success !== true) { void failed(id, 'close-save-failed'); return; }
            cancel(pending.timer);
            pending = null;
            closing = true;
            close();
        },
    };
}
module.exports = { createCloseCheckpoint };
