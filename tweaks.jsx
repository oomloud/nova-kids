// Nova World wireframe — Tweaks island.
// Mounts a small React panel that toggles body classes / CSS vars on the
// otherwise-vanilla storyboard wall.
const { useEffect } = React;

const NW_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "annotations": true,
  "colorHints": true,
  "sketchMode": false,
  "scale": 0.72
}/*EDITMODE-END*/;

function NovaTweaks() {
  const [t, setTweak] = useTweaks(NW_TWEAK_DEFAULTS);

  useEffect(() => {
    document.body.classList.toggle('no-annotations', !t.annotations);
    document.body.classList.toggle('mono', !t.colorHints);
    document.body.classList.toggle('sketch', !!t.sketchMode);
    document.documentElement.style.setProperty('--wf-scale', String(t.scale));
  }, [t.annotations, t.colorHints, t.sketchMode, t.scale]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Storyboard" />
      <TweakToggle label="Annotations" value={t.annotations}
        onChange={(v) => setTweak('annotations', v)} />
      <TweakToggle label="Color hints" value={t.colorHints}
        onChange={(v) => setTweak('colorHints', v)} />
      <TweakToggle label="Sketch mode" value={t.sketchMode}
        onChange={(v) => setTweak('sketchMode', v)} />
      <TweakSection label="Frame size" />
      <TweakSlider label="Scale" value={t.scale} min={0.5} max={0.95} step={0.01}
        onChange={(v) => setTweak('scale', v)} />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById('tweaks-root')).render(<NovaTweaks />);
