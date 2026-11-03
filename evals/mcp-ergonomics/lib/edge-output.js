// A pipe chunk can end inside UTF-8. Decode the stream, never each Buffer alone.
export function consumeUtf8Output(stream, consume) {
  stream.setEncoding('utf8');
  stream.on('data', consume);
}

// A long session may finish on another UTC or host-local calendar day. Lookup
// remains scoped to its observed thread ID and these dates, never all sessions.
export function rolloutDates(startedAt, finishedAt = Date.now()) {
  const dates=new Set();
  for(const value of [startedAt,finishedAt]) {
    const date=new Date(value);
    dates.add(date.toISOString().slice(0,10).replaceAll('-','/'));
    dates.add([date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('/'));
  }
  return [...dates];
}

// Only actual agent messages can prove user delivery; MCP/tool output cannot.
export function deliveredDocumentPages(pages, messages) {
  if (!pages.length) return false;
  let index=0,offset=0;
  for(const page of pages) {
    if(!page) return false;
    while(index<messages.length) {
      const start=messages[index].indexOf(page,offset);
      if(start>=0) {offset=start+page.length;break;}
      ++index;offset=0;
    }
    if(index===messages.length)return false;
  }
  return true;
}
