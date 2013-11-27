
/* -*- mode: js2; js2-basic-offset: 4; indent-tabs-mode: nil -*- */

// focus-effects: Apply effects on window focus/blur

// Copyright (C) 2011 Florian Mounier aka paradoxxxzero

// This program is free software: you can redistribute it and/or m odify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

// Author: Florian Mounier aka paradoxxxzero

const Clutter = imports.gi.Clutter;
const GLib = imports.gi.GLib;
const Lang = imports.lang;
const Shell = imports.gi.Shell;
const St = imports.gi.St;
const Gtk = imports.gi.Gtk;

const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const Panel = imports.ui.panel;
const PanelMenu = imports.ui.panelMenu;
const Tweener = imports.ui.tweener;
const Lightbox = imports.ui.lightbox;
const Screenshot = imports.ui.screenshot;

let tracker, display, app_system, focus_connection, workspace_connection, animations;
let text, button;

function colorFromRGBA(rgba) {
            return new Clutter.Color({ red: rgba.red * 255,
                                       green: rgba.green * 255,
                                       blue: rgba.blue * 255,
                                       alpha: rgba.alpha * 255 });
        }

const FLASHSPOT_ANIMATION_OUT_TIME = 0.75; // seconds

const Flashspot = new Lang.Class({
    Name: 'Flashspot',
    Extends: Lightbox.Lightbox,

    _init: function(area, windowMeta) {
        this.parent(Main.uiGroup, { inhibitEvents: true,
                                    width: area.width,
                                    height: area.height });

        this.actor.style_class = 'focusflash';
        this.actor.set_position(area.x, area.y);
        this.app = tracker.get_window_app(windowMeta);
        let icon = this.app.create_icon_texture(area.height<area.width? area.height : area.width);
        this.actor.add_actor(icon);

        this.actor.scale_center_x =  0;
        this.actor.scale_center_y =  0;
        this.actor.set_pivot_point(0, 0.5);

/*        Tweener.addTween(this.actor, { opacity: 0, 
         time: FLASHSPOT_ANIMATION_OUT_TIME, transition:'easeInExpo', 
        });
*/

        Tweener.addTween(this.actor, {
          y: -this.actor.height,
          time: FLASHSPOT_ANIMATION_OUT_TIME,
          onComplete: function() {
            this.destroy();
          }, 
          transition: 'easeInExpo',
         });

 		    let path = new Gtk.WidgetPath();
        path.append_type(Gtk.IconView);

        let context = new Gtk.StyleContext();
        context.set_path(path);
        //context.add_class('rubberband');
 /* let context = new Gtk.StyleContext();*/

        this.actor.border_width = '40px';
        this.actor.border_radius = '20px';

        this.actor.border_color = colorFromRGBA(context.get_border_color(Gtk.StateFlags.NORMAL));
        this.actor.background_color = colorFromRGBA(context.get_background_color(Gtk.StateFlags.NORMAL));
    },

    fire: function() {
        this.actor.show();
        this.actor.opacity = 255;
    }
});




function update () {


    let running = app_system.get_running();
    for(var i = 0; i < running.length; i++) {
        let windows = running[i].get_windows();
        for(var j = 0; j < windows.length; j++) {
            if ((!display.focus_window) || (display.focus_window != windows[j])) {


                let actor = windows[j].get_compositor_private();
                if(actor) {
                    //if (actor != display.focus_window.get_compositor_private()) {
                    //if (!actor.has_key_focus()) {
                    //Tweener.removeTweens(actor);
                        if(animations.desaturate) {
                            let fx = actor.get_effect('desaturate');
                            if (!fx) {
                                fx = new Clutter.DesaturateEffect();
                                actor.add_effect_with_name('desaturate', fx);
                            }
                            Tweener.addTween(fx, { delay: animations.blur.time, factor: 1, time: 20});
                        }
                        /*
                         let fx = actor.get_effect('tint');
                         if (!fx) {
                         fx = new Clutter.ColorizeEffect();
                         actor.add_effect_with_name('tint', fx);
                         }
                         let mycolor = new Clutter.Color();
                         mycolor.red = 0;
                         mycolor.green = 0;
                         mycolor.blue = 0;
                         mycolor.alpha = 0;
                         fx.tint = mycolor;
                         Tweener.addTween(fx, { red: 120, green: 120, blue:160, time: 2});
                         */

                        //rfx.colorize_effect_set_tint(color);
                        //Tweener.addTween(fx, { factor: 1, time: 2});
                        //let vertex = new Clutter.Vertex();
                        //actor.scale_center_x = vertex.x = actor.width / 2;
                        //actor.scale_center_y = vertex.y = actor.height / 2;
                        //actor.rotation_center_z = vertex;
                        actor.set_pivot_point(0.5, 0.5);

                       // Tweener.autoOverwrite = false;
                        Tweener.addTween(actor, animations.blur);
                        if (animations.blur2) {
                            Tweener.addTween(actor, animations.blur2);
                        }
                    //}
                }
            }
        }
    }
    if(display.focus_window) {
        let actor = display.focus_window.get_compositor_private();
        if(actor) {
            //Tweener.removeTweens(actor);
            //Tweener.autoOverwrite = true;
                let fx = actor.get_effect('tint');
                if (fx) {
                    actor.remove_effect(fx);
                }



			 /*let flashspot = new Flashspot({ x : actor.x, y : actor.y, width: actor.width, height: actor.height}, display.focus_window);
      	 flashspot.fire();

      	 Tweener.addCaller(flashspot, {onUpdate:flashspot.fire, time:1, count:1});*/
/*

 		let clutter_text = new Clutter.Text();
		clutter_text.set_text("Hello from fartland");
		clutter_text.set_font_name("ubuntu 144");
		clutter_text.set_position(200, 200);
		Main.uiGroup.add_actor(clutter_text);
                let vertex = new Clutter.Vertex();
                clutter_text.scale_center_x = vertex.x = actor.width / 2;
                clutter_text.scale_center_y = vertex.y = actor.height / 2;
                clutter_text.rotation_center_z = vertex;
                clutter_text.scale_x = 1;
                Tweener.addTween(clutter_text,
                                 { "rotation-angle-z": 360,
                                     time: 5,

                                     transition: 'easeOutBounce'});
            _showHello();
*/
            if(animations.desaturate) {
                fx = actor.get_effect('desaturate');
                if (!fx) {
                    fx = new Clutter.DesaturateEffect();
                    actor.add_effect_with_name('desaturate', fx);
                }
                Tweener.addTween(fx, { factor: 0, time: 20});
           }
            //let vertex = new Clutter.Vertex();
            //actor.scale_center_x = vertex.x = actor.width / 2;
            //actor.scale_center_y = vertex.y = actor.height / 2;
            //actor.rotation_center_z = vertex;
            actor.set_pivot_point(0.5, 0.5);
            //Tweener.removeTweens(actor, 'opacity');
            //animations.focus["onComplete"] = removeTweens;
            //animations.focus["onCompleteParams"] = [actor, 'opacity'] ;
	    //Tweener.addTween(actor, {'time': 0, 'delay': animations.blur2.delay
            Tweener.addTween(actor, animations.focus);
        }
    }
}

function removeTweens(actor, prop) {
    //Tweener.removeTweens(actor, prop);
    Tweener.removeTweens(actor);
}

function draw_outline() {
    let cr = area.get_context();
}

function enable() {
    animations = null;
    let file;
    try {
        file = Shell.get_file_contents_utf8_sync('.ffxrc.json');
    } catch (e) {
        log('.ffxrc.json not found setting defaults');
    }
    if(file) {
        try {
            animations = JSON.parse(file);
            if(!animations.focus || !animations.blur) {
                throw {
                    message: 'Invalid json, must constain at least a focus and a blur property'
                };
            }
        } catch (e) {
            log('.ffxrc.json has errors setting defaults');
            animations = null;
            Main.notifyError('Failed to parse ffxrc', e.message);
        }
    }
    // Default animations
    animations = animations || {
        desaturate: true,
        focus: {
            opacity: 255,
            time: 2
        },
        blur: {
            opacity: 200,
            time: 2
        }
    };
    Shell._ffx = { animations: animations };
    update();
    focus_connection = tracker.connect('notify::focus-app', update);
    workspace_connection = global.window_manager.connect('switch-workspace', update);
}


function init() {
    tracker = Shell.WindowTracker.get_default();
    display = global.display;
    app_system = Shell.AppSystem.get_default();
}


function disable() {
    tracker.disconnect(focus_connection);
    global.window_manager.disconnect(workspace_connection);
    let running = app_system.get_running();
    for(var i = 0; i < running.length; i++) {
        let windows = running[i].get_windows();
        for(var j = 0; j < windows.length; j++) {
            windows[j].get_compositor_private().remove_effect_by_name('desaturate');
        }
    }
}
