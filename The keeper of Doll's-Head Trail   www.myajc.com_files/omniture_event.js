/* <![CDATA[ */
function fire_omniture_event(s_node, event, event_name, event_data)
{
    // bail if the click event was from some ui widget, pretending to be
    // a user click
    if (!!event_data && event_data.type==='click' && !!event_data.namespace) {
        return;
    }
    s_node.linkTrackVars='events';
    s_node.linkTrackEvents=event;
    s_node.events=event;
    s_node.tl(this,'o', event_name);
}
/* ]]> */
