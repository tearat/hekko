var app = new Vue({
    el: "#app",
    data: {
        endpoint: "/app/app.php",
        debug: false,
        busy: false,
        location: 0,
        database: [],
        thread: {},
        comments: [],
        new_comment_title: "",
        new_comment_body: "",
        new_thread_title: "",
        new_thread_body: "",
    },
    methods: {
        find_by_id: function(id) {
            for(i=0; i<this.database.length; i++) {
                if ( this.database[i].id == id ) {
                    return i;
                }
            }
            return false;
        },
        load_database: function() {
            var that = this;
            var result = [];
            $.ajax({
                url: that.endpoint+"?action=load",
                cache: false,
                async: false,
            }).done(function (data) {
                result = JSON.parse(data);
            });
            
//            function compare_updates(a,b) {
//                return a.updated - b.updated;
//            }
//            
//            result.sort(compare_updates);
            
            that.database = result;
        },
        load_thread(id) {
            this.location = id;
            var target = this.find_by_id(id);
            this.thread = this.database[target];
            this.load_comments(id);
            
        },
        load_comments(id) {
            this.comments = [];
            if (id != 0) {
                for(i=0; i<this.database.length; i++) {
                    if ( this.database[i].parent == id ) {
                        this.comments.push(this.database[i]);
                    }
                }
            }
        },
        count_comments(id) {
            var count = 0;
            for(i=0; i<this.database.length; i++) {
                if(this.database[i].parent == id) {
                    count++;
                }
            }
            return count;  
        },
        add_comment(parent) {
            this.busy = true;
            if(this.new_comment_body != "") {
                if (this.new_comment_title == "") {
                    this.new_comment_title = "Анонимус";
                }
                this.database.push({
                    id: this.database[this.database.length-1].id+1,
                    title: this.new_comment_title,
                    body: this.new_comment_body,
                    parent: parent
                });
                this.new_comment_title = "";
                this.new_comment_body = "";
                
                // update time adding
                var target = this.find_by_id(parent);
                var unix_time = Math.floor( new Date().getTime()/1000 );
                this.database[target].updated = unix_time;
                
                this.save_database();
                this.load_comments(parent);
            }
            this.busy = false;
        },
        delete_comment(comment_id, thread_id) {
            this.busy = true;
            var target = this.find_by_id(comment_id);
            this.database.splice(target, 1);
            this.save_database();
            this.load_comments(thread_id);
            this.busy = false;
        },
        delete_thread(thread_id) {
            this.busy = true;
            
            for(i=this.database.length-1; i>=0; i--) {
                if(this.database[i].parent == thread_id) {
                    var target = this.find_by_id(this.database[i].id);
                    this.database.splice(target, 1);
                }
            }
            
            var target = this.find_by_id(thread_id);
            this.database.splice(target, 1);
            
            this.save_database();
            this.load_database();
            this.busy = false;
        },
        save_database() {
            this.busy = true;
            var that = this;
            $.ajax({
                type: "POST",
                url: that.endpoint,
                cache: false,
                async: false,
                data: {
                    action: 'save',
                    stream: JSON.stringify(that.database)
                }
            });
            this.busy = false;
        }
    },
    mounted: function() {
        this.load_database();
        if ( location.hash.substr(1) != "" ) {
            let id = location.hash.substr(1);
            this.location = id;
            this.load_thread(id);
        }
        var that = this;
        setInterval(function(){ 
            if (!that.busy) {
                that.load_database();
            }
            if (that.location > 0) {
                that.load_comments(that.location);
            }
        }, 1000);
    }
});

document.onkeydown = function(evt) {
    evt = evt || window.event;
    if (evt.keyCode == 27) {
        app.location = 0;
        location = "/";
    }
};